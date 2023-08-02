import httpStatus from "http-status";

import { userOtpVarification } from "@/config/otp";
import tokenTypes from "@/config/tokens";
import { Token, User, Activity } from "@/models";
import * as tokenService from "@/service/token.service";
import * as userService from "@/service/user.service";
// import fileUpload, { FileArray } from "express-fileupload";

import {
  IResetData,
  NewRegisteredUser,
  UserProfile,
} from "@/types/user.interfaces";
import ApiError from "@/utils/ApiError";

// import uploadFileInBucket from "@/utils/fileUpload";

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @param {string} captchaToken
 * @returns {Promise<User>}
 */
const loginUser = async (
  username: string,
  password: string,
  ip: string,
) => {
  let user: any = await User.findOne({ username });
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: "username is wrong",
    });
  }

  if (!(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: "wrong password",
    });
  }
  if (user.roles.includes('User')) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: "user not allow to login",
    });
  }
  const { roles, mobile } = user;
  const tokens = await tokenService.generateAuthTokens(user);

  if (tokens) {
    user.refreshToken = tokens.refreshToken;
    await user.save();
  }

  const countData = Activity.countDocuments({ username });
  if (countData > 25) {
    const oldestLog = await Activity.findOne({ username }).sort({ _id: 1 }).exec();
    await oldestLog.remove();
  }
  await Activity.create({ username, ip, detail: "login page visited" });

  return { roles, username, mobile, tokens };
};

/**
 * Create an user
 * @param {NewRegisteredUser} userBody
 * @returns {Promise<UserProfile>}
 */
const createUser = async (body: NewRegisteredUser): Promise<UserProfile> => {
  return userService.createUser(body);
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (
  refreshToken: string | undefined,
): Promise<void> => {
  if (refreshToken) {
    const refreshTokenDoc = await Token.findOne({
      token: refreshToken,
      type: tokenTypes.REFRESH,
      blacklisted: false,
    });
    if (!refreshTokenDoc) {
      throw new ApiError(httpStatus.BAD_REQUEST, { msg: "Not found" });
    }
    await Token.deleteMany({ user: refreshTokenDoc.user });
  }
};

// const fileUploadDemo = async (files: FileArray,isProposal = false) => {
const fileUploadDemo = async (): Promise<string[]> => {
  // console.log(isProposal);
  // console.log(files.document);
  // TODO:: implement function logic here
  const uploadedFileKeys: string[] = [];

  // single file uploaded
  // if (files.document) {
  //   const singleFile = files.document as fileUpload.UploadedFile;
  //   uploadedFileKeys.push(await uploadFileInBucket(singleFile, isProposal));
  // }

  // // if multifile uploaded
  // if (files.documents) {
  //   const multiFile = files.documents as fileUpload.UploadedFile[];
  //   multiFile.forEach(async file => {
  //     uploadedFileKeys.push(await uploadFileInBucket(file, isProposal));
  //   });
  // }

  return uploadedFileKeys;

  // console.log("res: ", res);
  // delete code demo
  // const res = s3BucketService.deleteFile(
  //   "filename"
  // );
  // console.log("res: ", res);
  // get file full url
  // const res = s3BucketService.getFile(
  //   "filename"
  // );
  // console.log("res: ", res);
  // upload file demo
  //   await multiFileUpload(req.files);
  // }
  // const { attachments } = req.body;
  // console.log("attachments: ", attachments);
};

const resetPasswordbyOtp = async (resetData: IResetData): Promise<void> => {
  const {
    email,
    mobile,
    countryCode,
    otp: userotp,
    password,
    source,
  } = resetData;

  const user =
    source === userOtpVarification.EMAIL && email
      ? await userService.getUserByEmail(email)
      : source === userOtpVarification.PHONE &&
      countryCode &&
      mobile &&
      (await userService.getUserByMobileNo(countryCode, mobile));


};

export {
  createUser,
  fileUploadDemo,
  loginUser,
  logout,
  resetPasswordbyOtp,
};
