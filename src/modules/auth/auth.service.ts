import httpStatus from "http-status";
import mongoose from "mongoose";

import configs from "@/config/config";
import { userOtpVarification } from "@/config/otp";
import tokenTypes from "@/config/tokens";
import { userPlatform } from "@/config/users";
import { DeviceToken, Token, User } from "@/models";
import * as OtpService from "@/modules/otp/otp.service";
import * as emailService from "@/service/email.service";
import * as tokenService from "@/service/token.service";
import * as userService from "@/service/user.service";
// import fileUpload, { FileArray } from "express-fileupload";
import {
  AccessAndRefreshTokens,
  IUserWithTokens,
} from "@/types/token.interfaces";
import {
  ClientObject,
  IResetData,
  NewRegisteredUser,
  UserProfile,
} from "@/types/user.interfaces";
import ApiError from "@/utils/ApiError";
import checkRecaptcha from "@/utils/captcha";
import messages from "@/utils/messages";
import { verifyCountryCode } from "@/utils/utils";

const { loginTypes, mailExpiration } = configs;
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
  client: ClientObject
): Promise<AccessAndRefreshTokens> => {
  if (!(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      code: messages.auth.AUTH_INVALID_CRED,
    });
  }
  // check condition
  let code;
  let data;
  if (loginTypes.emailAndPhone) {
    if (!user.isEmailVerified && !user.isPhoneVerified) {
      code = messages.auth.EMAIL_AND_PHONE_NOT_VERIFIED;
      data = {
        isEmailVerified: false,
        isPhoneVerified: false,
      };
    } else if (!user.isEmailVerified) {
      code = messages.auth.EMAIL_NOT_VERIFIED;
      data = {
        isEmailVerified: false,
      };
    } else if (!user.isPhoneVerified) {
      code = messages.auth.PHONE_NOT_VERIFIED;
      data = {
        isPhoneVerified: false,
      };
    }
  } else if (loginTypes.email && !user.isEmailVerified) {
    code = messages.auth.EMAIL_NOT_VERIFIED;
    data = {
      isEmailVerified: false,
    };
  } else if (loginTypes.phone && !user.isPhoneVerified) {
    code = messages.auth.PHONE_NOT_VERIFIED;
    data = {
      isPhoneVerified: false,
    };
  }

  if (code) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      code,
      data,
    });
  }

  return tokenService.generateAuthTokens(user, client);
};
/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @param {string} captchaToken
 * @returns {Promise<User>}
 */
const loginUser = async (
  mobileNo: string | undefined,
  countryCode: string | undefined,
  email: string | undefined,
  password: string,
  captchaToken: string,
  client: ClientObject,
  userRole: string
): Promise<IUserWithTokens> => {
  const validateCaptcha = await checkRecaptcha(captchaToken);
  if (!validateCaptcha) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      code: messages.CAPTCHA_INVALID,
    });
  }
  let user = null;
  if (email)
    user = await User.findOne({
      $and: [{ email }, { isDeleted: false }, { userRole }],
    });
  else if (mobileNo && countryCode)
    user = await User.findOne({
      $and: [{ countryCode }, { mobileNo }, { isDeleted: false }, { userRole }],
    });
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      code: messages.auth.AUTH_INVALID_CRED,
    });
  }
  const tokens = await handleLogin(user, password, client);
  return { tokens, user };
};

/**
 * Create an user
 * @param {NewRegisteredUser} userBody
 * @returns {Promise<UserProfile>}
 */
const createUser = async (body: NewRegisteredUser): Promise<UserProfile> => {
  if (loginTypes.email) {
    if (!body.email) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        code: messages.EMAIL_REQUIRED,
      });
    }
    const validateCaptcha = await checkRecaptcha(body.captchaToken);
    if (!validateCaptcha) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        code: messages.CAPTCHA_INVALID,
      });
    }
  }

  if (loginTypes.phone) {
    if (!body.mobileNo) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        code: messages.PHONE_REQUIRED,
      });
    }
    verifyCountryCode(body.countryCode);
  }
  return userService.createUser(body);
};
/**
 * Verify email
 * @param {string} token
 * @param {mongoose.Types.ObjectId} userId
 * @returns {Promise<UserProfile | null>}
 */
const verifyEmail = async (
  token: string,
  userId: mongoose.Types.ObjectId
): Promise<string> => {
  const user: UserProfile | null = await userService.getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, { code: "USER NOT FOUND" });
  }

  if (user && user.isEmailVerified === true) {
    return messages.auth.EMAIL_ALREADY_VERIFIED;
  }

  const isEmailTokenExpired = await tokenService.checkEmailTokenExpired(
    user,
    token
  );
  if (isEmailTokenExpired) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      code: messages.auth.TOKEN_EXPIRED,
    });
  }
  await Token.deleteMany({ user: userId, type: tokenTypes.VERIFY_EMAIL });
  await userService.updateUserById(userId, { isEmailVerified: true });
  return messages.auth.EMAIL_VERIFY_SUCCESSFULLY;
};

const sendVerificationEmail = async (
  type: string,
  email: string,
  captchaToken: string,
  role: string
): Promise<string> => {
  if (type === "forgotPassword" && captchaToken && captchaToken !== "") {
    const validateCaptcha = await checkRecaptcha(captchaToken, true);
    if (!validateCaptcha) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        code: messages.CAPTCHA_INVALID,
      });
    }
  }
  const user: UserProfile | null = await userService.getUserByEmail(email);
  let token = "";
  const fullName = `${user.firstName} ${user.lastName}`;
  if (type === "verifyAccount") {
    token = await tokenService.generateVerifyEmailToken(user);
    await emailService.sendVerificationEmail(
      user.email,
      token,
      fullName,
      user.id,
      role
    );
  }
  if (type === "forgotPassword" || type === "re-send-forgotPassword") {
    token = await tokenService.generateResetPasswordToken(email);
    await emailService.sendResetPasswordEmail(user, token, role);
  }
  return messages.auth.MAIL_SENT_SUCCESSFULLY;
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPasswordByLink = async (
  resetPasswordToken: string,
  newPassword: string
): Promise<void> => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(
      resetPasswordToken,
      tokenTypes.RESET_PASSWORD
    );
    const user = await userService.getUserById(
      new mongoose.Types.ObjectId(resetPasswordTokenDoc.user)
    );
    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, {
        code: messages.USER_UNAUTHORIZED,
      });
    }

    const today = new Date();
    const expiry = new Date(resetPasswordTokenDoc.createdAt);
    expiry.setDate(expiry.getDate() + mailExpiration);
    if (expiry < today) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        code: messages.auth.TOKEN_EXPIRED,
      });
    }
    await userService.updateUserById(user.id, { password: newPassword });
    await Token.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, {
      code: messages.USER_UNAUTHORIZED,
    });
  }
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (
  refreshToken: string | undefined,
  deviceToken: string | undefined,
  client: ClientObject
): Promise<void> => {
  if (refreshToken) {
    const refreshTokenDoc = await Token.findOne({
      token: refreshToken,
      type: tokenTypes.REFRESH,
      blacklisted: false,
    });
    if (!refreshTokenDoc) {
      throw new ApiError(httpStatus.BAD_REQUEST, { code: "Not found" });
    }
    await Token.deleteMany({ user: refreshTokenDoc.user });
  }

  if (client.platform !== userPlatform.WEB && !deviceToken) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      code: messages.INVALID_REQUEST,
    });
  }
  if (
    (client.platform === userPlatform.ANDROID ||
      client.platform === userPlatform.IOS) &&
    deviceToken
  ) {
    await DeviceToken.updateOne({ deviceToken }, { $unset: { user: 1 } });
  }
  // await refreshTokenDoc.remove();
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
      code: messages.otp.INCORRECT_OTP,
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

const forgotPasswordByEmail = async (email: string): Promise<void> => {
  const user: UserProfile | null = await User.findOne({
    $and: [{ email }, { isDeleted: false }],
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

const isValidLogin = (
  email: string | undefined,
  mobileNo: string | undefined,
  countryCode: string | undefined
): boolean =>
  !(
    (!loginTypes.email && email) ||
    (loginTypes.email && !email) ||
    (!loginTypes.phone && (mobileNo || countryCode)) ||
    (loginTypes.phone && (!mobileNo || !countryCode)) ||
    (loginTypes.emailAndPhone && (!mobileNo || !countryCode || !email))
  );

export {
  createUser,
  fileUploadDemo,
  forgotPasswordByEmail,
  forgotPasswordByMobile,
  isValidLogin,
  loginUser,
  logout,
  resetPasswordByLink,
  resetPasswordbyOtp,
  sendVerificationEmail,
  verifyEmail,
};
