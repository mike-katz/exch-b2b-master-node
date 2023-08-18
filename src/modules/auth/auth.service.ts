import httpStatus from "http-status";

import { userOtpVarification } from "@/config/otp";
import tokenTypes from "@/config/tokens";
import { Token, User, ActivityLog } from "@/models";
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
const addActivity = async (foundUser: any, activity: any, status: string) => {
  try {
    const activityPayload = {
      username: foundUser.username,
      ip: activity?.query,
      detail: JSON.stringify(activity),
      status,
    };

    const findActivity = await ActivityLog
      .find({ username: foundUser.username }).countDocuments().lean();

    if (findActivity > 25) {
      const firstRecord: any = await ActivityLog
        .findOne({ username: foundUser.username }, { sort: { createdAt: 1 } });
      if (firstRecord) {
        await ActivityLog.findByIdAndDelete({ _id: firstRecord._id });
      }
    }
    await ActivityLog.create(activityPayload);
  } catch (err) {
    return false;
  }
};
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
    await addActivity(user, ip, 'failed');
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: "wrong password",
    });
  }
  if (user.roles.includes('User')) {
    await addActivity(user, ip, 'failed');
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: "user not allow to login",
    });
  }

  if (user.status == "Lock") {
    await addActivity(user, ip, 'failed');
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: `your account ${user.status}`,
    });
  }

  const { roles, mobile, balance, commision } = user;
  const tokens = await tokenService.generateAuthTokens(user);

  // if (tokens) {
  //   user.refreshToken = tokens.refreshToken;
  //   await user.save();
  // }
  const balanceData = balance > 0 ? parseFloat(balance.toString()) : 0;
  await addActivity(user, ip, 'success');
  const status = user?.parentStatus == "Active" ? user?.status : user?.parentStatus;
  return { roles, username, mobile, tokens, balanceData, status, commision };
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
