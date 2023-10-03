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
    const queryData = JSON.parse(activity)
    const activityPayload = {
      username: foundUser.username,
      ip: queryData?.query,
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
  ip: any,
  origin: any
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

  //origin check
  if (!user.roles.includes('Admin')) {
    if (user.origin !== origin) {
      await addActivity(user, ip, 'failed');
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "user not allow to login",
      });
    }
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

const changePwd = async (oldPassword: string, newPassword: string, userData: any) => {
  const user: any = await User.findOne({ username: userData.username })
  if (!(await user.isPasswordMatch(oldPassword))) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: "wrong password",
    });
  }
  user.password = newPassword;
  await user.save();
  return;
};

export {
  loginUser,
  changePwd
};
