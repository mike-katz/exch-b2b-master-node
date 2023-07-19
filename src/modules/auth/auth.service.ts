import httpStatus from "http-status";

import { userOtpVarification } from "@/config/otp";
import tokenTypes from "@/config/tokens";
import { Token, User } from "@/models";
import * as OtpService from "@/modules/otp/otp.service";
import * as tokenService from "@/service/token.service";
import * as userService from "@/service/user.service";
// import fileUpload, { FileArray } from "express-fileupload";
import {
  AccessAndRefreshTokens,
  IUserWithTokens,
} from "@/types/token.interfaces";
import {
  IResetData,
  NewRegisteredUser,
  UserProfile,
} from "@/types/user.interfaces";
import ApiError from "@/utils/ApiError";
import messages from "@/utils/messages";

// import uploadFileInBucket from "@/utils/fileUpload";

/**
 * handle login
 * @param {string} user
 * @param {string} password
 * @returns {Promise<AccessAndRefreshTokens>}
 */

const handleLogin = async (
  user: UserProfile,
  password: string,  
): Promise<AccessAndRefreshTokens> => {
  if (!(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: messages.auth.AUTH_INVALID_CRED,
    });
  }
  // check condition
  let code;
  let data;
  
    if (!user.isEmailVerified) {
      code = messages.auth.EMAIL_NOT_VERIFIED;
      data = {
        isEmailVerified: false,
      };
    } 

  if (code) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
     msg: code,
      data,
    });
  }

  return tokenService.generateAuthTokens(user);
};
/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @param {string} captchaToken
 * @returns {Promise<User>}
 */
const loginUser = async (
  email: string | undefined,
  password: string,  
): Promise<IUserWithTokens> => {
  let user = await User.findOne({
      $and: [{ email }, { isDeleted: false }],
    });
  
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: messages.auth.AUTH_INVALID_CRED,
    });
  }
  const tokens = await handleLogin(user, password);
  return { tokens, user };
};

/**
 * Create an user
 * @param {NewRegisteredUser} userBody
 * @returns {Promise<UserProfile>}
 */
const createUser = async (body: NewRegisteredUser): Promise<UserProfile> => {
  if (!body.email) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: messages.EMAIL_REQUIRED,
      });
    }
  
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
    mobileNo,
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
        mobileNo &&
        (await userService.getUserByMobileNo(countryCode, mobileNo));

  if (user && user.otp && user.otp === userotp) {
    const updateVerifiication =
      source === userOtpVarification.EMAIL
        ? { isEmailVerified: true }
        : {
            isPhoneVerified: true,
          };

    const updateBody = {
      ...updateVerifiication,
      password,
      otp: null,
      sentOtpCount: 0,
    };

    Object.assign(user, updateBody);
    await user.save();

    // await userService.updateUserById(user.id, );
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: messages.otp.INCORRECT_OTP,
    });
  }
};
const forgotPasswordByMobile = async (
  countryCode: string,
  mobileNo: string
): Promise<void> => {
  const user: UserProfile | null = await User.findOne({
    $and: [{ countryCode }, { mobileNo }, { isDeleted: false }],
  });

  if (user) {
    const otpData = await OtpService.verifyOtpToken(user);
    await OtpService.handleSendOtpByMobile(user.id, otpData);
    // const to = MobileNoMasking(mobileNo);
    // const otpToken: string = await tokenService.generateEncryptedOtpToken(
    //   otpData.nextOtpTime
    // );
  }
};

export {
  createUser,
  fileUploadDemo,
  forgotPasswordByMobile,  
  loginUser,
  logout,
  resetPasswordbyOtp,  
};
