import httpStatus from "http-status";
import { isUndefined } from "lodash";
import moment, { DurationInputArg2 } from "moment";
import mongoose from "mongoose";

import config from "@/config/config";
import {
  maxOtpLimitAndTime,
  sendOtpTimer,
  userOtpVarification,
} from "@/config/otp";
import { User } from "@/models";
import { sendOtpEmail } from "@/service/email.service";
import * as tokenService from "@/service/token.service";
import { getUserByEmail, getUserByMobileNo } from "@/service/user.service";
import {
  AccessAndRefreshTokens,
  IUserWithTokens,
} from "@/types/token.interfaces";
import { UserProfile } from "@/types/user.interfaces";
import ApiError from "@/utils/ApiError";
import messages from "@/utils/messages";
import { verifyCountryCode } from "@/utils/utils";

import { IOtpReqestData, ISendOtpRes, IUserOtpData } from "./otp.interfaces";

interface UsersOtp extends UserProfile {
  otp: number;
}

const generateOTP = (): number => Math.floor(1000 + Math.random() * 9000);

const genrateNextOtpTime = (): string => {
  const curretDate = moment().utc().format();

  return moment(curretDate)
    .add(sendOtpTimer.time, sendOtpTimer.unit as DurationInputArg2)
    .unix()
    .toString();
};

const sendOtpToMobile = async (): Promise<void> => {
  // OTP send third party package implementation
};

const MobileNoMasking = (mobileNo: string): string =>
  `********${mobileNo.slice(-4)}`;
const emailMasking = (email: string): string => {
  // Split the email address into username and domain parts
  const [username, domain] = email.split("@");

  // Mask the username
  const maskedUsername = `${username.charAt(0)}***${username.slice(-1)}`;

  // Return the masked email address
  return `${maskedUsername}@${domain}`;
};

const requestValidation = async (body: IOtpReqestData): Promise<void> => {
  if (
    (!config.loginTypes.email && body.source === userOtpVarification.EMAIL) ||
    (!config.loginTypes.phone && body.source === userOtpVarification.PHONE)
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: messages.INVALID_REQUEST,
    });
  }
};

const handleSendOtpByMobile = async (
  userId: mongoose.Types.ObjectId,
  otpData: IUserOtpData
): Promise<void> => {
  // updateOtpData
  await User.findByIdAndUpdate(userId, otpData);
  await sendOtpToMobile();
};

const generateOtpData = async (
  usersentOtpCount: number,
  otpTime: Date | string | undefined,
  otp: number | undefined
): Promise<IUserOtpData> => {
  let sentOtpCount = usersentOtpCount || 0;
  const curretDate = moment().utc().format();
  let nextOtpTime: string;

  if (!isUndefined(otpTime)) {
    const nextMaxResendOtpDate = moment(otpTime)
      .add(
        maxOtpLimitAndTime.time,
        maxOtpLimitAndTime.unit as DurationInputArg2
      )
      .format();
    const nextResendOtpDate = moment(otpTime)
      .add(sendOtpTimer.time, sendOtpTimer.unit as DurationInputArg2)
      .format();
    if (
      usersentOtpCount < maxOtpLimitAndTime.limit &&
      new Date(curretDate) < new Date(nextResendOtpDate)
    ) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: messages.otp.WAIT_OTP_ONE_MIN,
      });
    }
    if (
      usersentOtpCount >= maxOtpLimitAndTime.limit &&
      new Date(curretDate) < new Date(nextMaxResendOtpDate)
    ) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: messages.otp.WAIT_OTP_ONE_HOUR,
      });
    }
    sentOtpCount =
      sentOtpCount >= maxOtpLimitAndTime.limit ? 1 : sentOtpCount + 1;
  }

  if (sentOtpCount <= 2) {
    const nextOneMinitTime = moment(curretDate)
      .add(sendOtpTimer.time, sendOtpTimer.unit as DurationInputArg2)
      .format();
    nextOtpTime = moment(nextOneMinitTime).unix().toString();
  } else {
    const nextOneHourTime = moment(curretDate)
      .add(
        maxOtpLimitAndTime.time,
        maxOtpLimitAndTime.unit as DurationInputArg2
      )
      .format();
    nextOtpTime = moment(nextOneHourTime).unix().toString();
  }

  return {
    nextOtpTime,
    otp: otp ?? generateOTP(),
    sentOtpCount,
    otpTime: curretDate,
  };
};

const verifyOtpToken = async (
  user: UserProfile,
  encryptedOtpToken?: string | undefined
): Promise<IUserOtpData> => {
  const {
    nextOtpTime: userNextOtpTime,
    sentOtpCount: usersentOtpCount,
    otpTime,
    otp,
  } = user;

  if (encryptedOtpToken) {
    const decryptedOtpTime =
      tokenService.decodeEncryptedOtpToken(encryptedOtpToken);
    if (userNextOtpTime && userNextOtpTime !== decryptedOtpTime) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: messages.otp.INVALID_OTP_TOKEN,
      });
    }
  }
  // else if (userNextOtpTime) {
  //   const curretDate = moment().utc().unix().toString();
  //   if (curretDate < userNextOtpTime) {
  //     throw new ApiError(httpStatus.BAD_REQUEST, {
  //       msg: messages.INVALID_REQUEST,
  //     });
  //   }
  // }

  return generateOtpData(usersentOtpCount, otpTime, otp);
};

const sendOtpByMobile = async (
  countryCode: string,
  mobileNo: string,
  encryptedOtpToken: string | undefined
): Promise<ISendOtpRes> => {
  verifyCountryCode(countryCode);

  const user: UserProfile | null = await getUserByMobileNo(
    countryCode,
    mobileNo
  );
  // if (user.otp && !encryptedOtpToken) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, {
  //     msg: messages.otp.OTP_TOKEN_REQUIRED,
  //   });
  // }
  const otpData = await verifyOtpToken(user, encryptedOtpToken);

  await handleSendOtpByMobile(user.id, otpData);
  const to = MobileNoMasking(mobileNo);
  const otpToken: string = await tokenService.generateEncryptedOtpToken(
    otpData.nextOtpTime
  );
  return {
    to,
    otpToken,
  };
};

const sendOtpByEmail = async (email: string): Promise<{ to: string }> => {
  const user = await getUserByEmail(email);
  if (user.otp) {
    await sendOtpEmail(user);
  } else {
    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      {
        otp: generateOTP(),
      },
      { new: true }
    );

    if (updatedUser) await sendOtpEmail(updatedUser);
  }
  const to = emailMasking(email);
  return {
    to,
  };
};

const verifyOtpByMobile = async (
  countryCode: string,
  mobileNo: string,
  userOtp: number
): Promise<IUserWithTokens | { isEmailVerified: boolean }> => {
  const user: UsersOtp = await getUserByMobileNo(countryCode, mobileNo);
  if (user.otp && user.otp === userOtp) {
    // user verified
    await User.findByIdAndUpdate(user.id, {
      isPhoneVerified: true,
      otp: null,
      sentOtpCount: 0,
    });

    if (config.loginTypes.emailAndPhone && !user.isEmailVerified) {
      return { isEmailVerified: false };
    }
    const tokens = await tokenService.generateAuthTokens(user);
    return {
      user,
      tokens,
    };
  }
  throw new ApiError(httpStatus.BAD_REQUEST, {
    msg: messages.otp.INCORRECT_OTP,
  });
};

const verifyOtpByEmail = async (
  email: string,
  userOtp: number
): Promise<
  | { user: UserProfile; tokens: AccessAndRefreshTokens }
  | { isPhoneVerified: boolean }
> => {
  const user: UsersOtp = await getUserByEmail(email);
  if (user.otp && user.otp === userOtp) {
    // user verified
    await User.findByIdAndUpdate(user.id, {
      isEmailVerified: true,
      otp: null,
    });
    if (config.loginTypes.emailAndPhone && !user.isPhoneVerified) {
      return {
        isPhoneVerified: false,
      };
    }
    const tokens = await tokenService.generateAuthTokens(user);
    return {
      user,
      tokens,
    };
  }
  throw new ApiError(httpStatus.BAD_REQUEST, {
    msg: messages.otp.INCORRECT_OTP,
  });
};

export {
  genrateNextOtpTime,
  handleSendOtpByMobile,
  requestValidation,
  sendOtpByEmail,
  sendOtpByMobile,
  verifyOtpByEmail,
  verifyOtpByMobile,
  verifyOtpToken,
};
