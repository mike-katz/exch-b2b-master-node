import httpStatus from "http-status";
import mongoose from "mongoose";

import { User } from "@/models";
import { Options, QueryResult } from "@/models/plugins/paginate.plugin";
import {
  NewRegisteredUser,
  UpdateUserBody,
  UserProfile,
} from "@/types/user.interfaces";
import ApiError from "@/utils/ApiError";
import messages from "@/utils/messages";
/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email: string): Promise<UserProfile> => {
  const user = await User.findOne({
    $and: [{ email }, { isDeleted: false }],
  });
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: messages.USER_NOT_FOUND,
    });
  }
  return user;
};

/**
 * Get user by email
 * @param {string} countryCode
 * @param {string} mobile
 * @returns {Promise<User>}
 */
const getUserByMobileNo = async (
  countryCode: string,
  mobile: string
): Promise<UserProfile> => {
  const user = await User.findOne({
    $and: [{ countryCode }, { mobile }, { isDeleted: false }],
  });

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: messages.USER_NOT_FOUND,
    });
  }
  return user;
};

/**
 * Create an user
 * @param {NewRegisteredUser} userBody
 * @returns {Promise<UserProfile>}
 */
const createUser = async (
  userBody: NewRegisteredUser
): Promise<UserProfile> => {
  if (userBody.mobile && (await User.isMobileNoTaken(userBody.mobile))) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: messages.auth.AUTH_MOBILE_ALREADY_EXIST,
    });
  }
  const user = await User.create(userBody);
  if (!user) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, {
      msg: messages.SOMETHING_WENT_WRONG,
    });
  }
  return user;
};

/**
 * Get user by id
 * @param {mongoose.Types.ObjectId} id
 * @returns {Promise<UserProfile | null>}
 */
const getUserById = async (
  id: mongoose.Types.ObjectId
): Promise<UserProfile | null> => User.findById(id);

/**
 * Update user by id
 * @param {mongoose.Types.ObjectId} userId
 * @param {UpdateUserBody} updateBody
 * @returns {Promise<UserProfile | null>}
 */
const updateUserById = async (
  userId: mongoose.Types.ObjectId,
  updateBody: UpdateUserBody
): Promise<UserProfile | null> => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: messages.USER_NOT_FOUND,
    });
  }
  if (updateBody.username && (await User.isUsernameTaken(updateBody.username, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: messages.auth.AUTH_EMAIL_ALREADY_EXIST,
    });
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (
  filter: Record<string, null>,
  options: Options
): Promise<QueryResult> => User.paginate(filter, options);

const isSocialLogin = (url: string): boolean =>
  url === "/login/google" ||
  url === "/login/facebook" ||
  url === "/login/apple";

export {
  createUser,
  getUserByEmail,
  getUserById,
  getUserByMobileNo,
  isSocialLogin,
  queryUsers,
  updateUserById,
};
