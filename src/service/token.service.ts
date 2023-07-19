import httpStatus from "http-status";
import jwt, { JwtPayload } from "jsonwebtoken";
import moment, { Moment } from "moment";
import mongoose from "mongoose";

import config from "@/config/config";
import tokenTypes from "@/config/tokens";
import { DeviceToken, Token, User } from "@/models";
import { AccessAndRefreshTokens, ITokenDoc } from "@/types/token.interfaces";
import { ClientObject, UserProfile } from "@/types/user.interfaces";
import ApiError from "@/utils/ApiError";
import messages from "@/utils/messages";

import * as userService from "./user.service";

interface EncryptedOtpPayload {
  sub: {
    nextOtpTime: string;
  };
}

/**
 * Generate token
 * @param {mongoose.Types.ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
const generateToken = (
  userId: mongoose.Types.ObjectId,
  expires: Moment,
  type: string,
  secret: string = config.jwt.secret
): string => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  return jwt.sign(payload, secret);
};

/**
 * Save a token
 * @param {string} token
 * @param {mongoose.Types.ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {boolean} [blacklisted]
 * @returns {Promise<ITokenDoc>}
 */
const saveToken = async (
  token: string,
  userId: mongoose.Types.ObjectId,
  expires: Moment,
  type: string,
  blacklisted = false
): Promise<ITokenDoc> =>
  Token.create({
    token,
    user: userId,
    expires: expires.toDate(),
    type,
    blacklisted,    
  });

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<ITokenDoc>}
 */
const verifyToken = async (token: string, type: string): Promise<ITokenDoc> => {
  const payload = jwt.verify(token, config.jwt.secret);
  const tokenDoc = await Token.findOne({
    token,
    type,
    user: payload.sub,
    blacklisted: false,
  });
  if (!tokenDoc) {
    throw new ApiError(httpStatus.UNAUTHORIZED, {
      msg: messages.UNAUTHORIZED_ACCESS,
    });
  }
  return tokenDoc;
};

/**
 * Generate auth tokens
 * @param {UserProfile} user
 * @returns {Promise<AccessAndRefreshTokens>}
 */
const generateAuthTokens = async (
  user: UserProfile,
): Promise<AccessAndRefreshTokens> => {
  const accessTokenExpires = moment().add(
    config.jwt.accessExpirationMinutes,
    "minutes"
  );
  const accessToken = generateToken(
    user.id,
    accessTokenExpires,
    tokenTypes.ACCESS
  );

  const refreshTokenExpires = moment().add(
    config.jwt.refreshExpirationDays,
    "days"
  );
  const refreshToken = generateToken(
    user.id,
    refreshTokenExpires,
    tokenTypes.REFRESH
  );
  await saveToken(
    refreshToken,
    user.id,
    refreshTokenExpires,
    tokenTypes.REFRESH,    
  );

  // TODO channge response object remove expire
  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

/**
 * Generate reset password token
 * @param {string} email
 * @returns {Promise<string>}
 */
const generateResetPasswordToken = async (email: string): Promise<string> => {
  const user = await userService.getUserByEmail(email);
  const expires = moment().add(
    config.jwt.resetPasswordExpirationMinutes,
    "minutes"
  );
  const resetPasswordToken = generateToken(
    user.id,
    expires,
    tokenTypes.RESET_PASSWORD
  );
  await saveToken(
    resetPasswordToken,
    user.id,
    expires,
    tokenTypes.RESET_PASSWORD
  );
  return resetPasswordToken;
};

/**
 * Generate verify email token
 * @param {UserProfile} user
 * @returns {Promise<string>}
 */
const generateVerifyEmailToken = async (user: UserProfile): Promise<string> => {
  const expires = moment().add(
    config.jwt.verifyEmailExpirationMinutes,
    "minutes"
  );
  const verifyEmailToken = generateToken(
    user.id,
    expires,
    tokenTypes.VERIFY_EMAIL
  );
  await saveToken(verifyEmailToken, user.id, expires, tokenTypes.VERIFY_EMAIL);
  return verifyEmailToken;
};

const decodeEncryptedOtpToken = (otpToken: string): string => {
  try {
    const payload = jwt.verify(otpToken, config.jwt.secret) as JwtPayload &
      EncryptedOtpPayload;
    if (payload && payload.sub && payload.sub.nextOtpTime) {
      const { nextOtpTime } = payload.sub;
      return nextOtpTime;
    }
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: messages.otp.INVALID_OTP_TOKEN,
    });
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: messages.otp.INVALID_OTP_TOKEN,
    });
  }
};

const generateEncryptedOtpToken = async (
  nextOtpTime: string
): Promise<string> => {
  const payload: EncryptedOtpPayload = {
    sub: { nextOtpTime },
  };
  return jwt.sign(payload, config.jwt.secret);
};

const refreshTokenService = async (
  refreshToken: string
): Promise<{
  access: {
    token: string;
    expires: Date;
  };
}> => {
  const verifiedToken = await verifyToken(refreshToken, tokenTypes.REFRESH);
  if (!verifiedToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, {
      msg: messages.auth.INVALID_REFRESH_TOKEN,
    });
  }
  const user: UserProfile | null = await User.findById(verifiedToken.user);
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, {
      msg: messages.USER_NOT_FOUND,
    });
  }
  const accessTokenExpires: Moment = moment().add(
    config.jwt.accessExpirationMinutes,
    "minutes"
  );
  const accessToken: string = generateToken(
    user.id,
    accessTokenExpires,
    tokenTypes.ACCESS
  );
  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
  };
};

/**
 * Generate verify email token
 * @param {UserProfile} user
 * @returns {Promise<string>}
 */
const checkEmailTokenExpired = async (
  user: UserProfile,
  userToken: string
): Promise<boolean> => {
  // Check if the token is expired
  const token = await Token.findOne({
    type: tokenTypes.VERIFY_EMAIL,
    user: user.id,
    token: userToken,
  });

  if (!token) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, {
      msg: messages.auth.AUTH_EMAIL_VERIFICATION_ISSUE,
    });
  }
  return token.expires < new Date();
};

const addUpdateDeviceToken = async (
  deviceToken: string,
  user: UserProfile | false
): Promise<void> => {
  const finddeviceToken = await DeviceToken.findOne({ deviceToken });
  if (user) {
    if (finddeviceToken) {
      finddeviceToken.user = user.id;
      await finddeviceToken.save();
    } else {
      await DeviceToken.create({ user: user.id, deviceToken });
    }
  } else if (finddeviceToken) {
    finddeviceToken.user = undefined;
    await finddeviceToken.save();
  } else {
    await DeviceToken.create({ deviceToken });
  }
};

export {
  addUpdateDeviceToken,
  checkEmailTokenExpired,
  decodeEncryptedOtpToken,
  generateAuthTokens,
  generateEncryptedOtpToken,
  generateResetPasswordToken,
  generateToken,
  generateVerifyEmailToken,
  refreshTokenService,
  saveToken,
  verifyToken,
};
