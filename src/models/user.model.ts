// const mongoose = require("mongoose");
// import { isEmail } from "validator";
import bcrypt from "bcryptjs";
import mongoose, { Document } from "mongoose";
import validator from "validator";

import config from "@/config/config";
import { roles } from "@/config/roles";
import { userPlatform } from "@/config/users";
import { UserModel, UserProfile } from "@/types/user.interfaces";

import * as plugin from "./plugins";

const { loginTypes } = config;

const isPhoneRequred = (): boolean =>
  (loginTypes.phone || loginTypes.emailAndPhone) &&
  !loginTypes.apple &&
  !loginTypes.facebook &&
  !loginTypes.google;

const isEmailRequired = (): boolean =>
  loginTypes.email || loginTypes.emailAndPhone;

const userSchema = new mongoose.Schema<UserProfile, UserModel>(
  {
    firstName: { type: String, required: true, trim: true },

    lastName: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: isEmailRequired,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value: string): void {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email");
        }
      },
    },

    password: {
      type: String,
      required: false,
      trim: true,
      minlength: 5,
      validate(value: string): void {
        if (!/\d/.test(value) || !/[A-Za-z]/.test(value)) {
          throw new Error(
            "Password must contain at least one letter and one number"
          );
        }
      },
      private: true, // used by the toJSON plugins
    },

    mobileNo: {
      type: String,
      required: isPhoneRequred,
      trim: true,
    },
    countryCode: {
      type: String,
      required: isPhoneRequred,
      trim: true,
    },

    isPhoneVerified: {
      type: Boolean,
      required: isPhoneRequred,
      default: false,
    },

    isEmailVerified: {
      type: Boolean,
      required: isEmailRequired,
      default: false,
    },

    userRole: {
      type: String,
      enum: roles,
      default: "user",
    },

    otp: {
      type: Number,
      required: false,
    },

    otpTime: {
      type: Date,
    },

    nextOtpTime: { type: String },

    sentOtpCount: {
      type: Number,
      default: 0,
    },

    client: {
      type: {
        bundleId: String,
        platform: {
          type: String,
          enum: userPlatform,
          default: userPlatform.WEB,
        },
        hardware: String,
        product: String,
        softwareName: String,
        softwareVersion: String,
        version: String,
        buildNumber: String,
        ip: String,
        route: String,
      },
      required: false,
    },

    googleId: {
      type: String,
      required: false,
    },

    facebookId: {
      type: String,
      required: false,
    },

    appleId: {
      type: String,
      required: false,
    },

    isDeleted: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  { timestamps: true }
);
// add plugin that converts mongoose to json
userSchema.plugin(plugin.toJSON);
userSchema.plugin(plugin.paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function isEmailTaken(
  this: UserModel,
  email: string,
  excludeUserId: string
): Promise<boolean> {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if mobileNo is taken
 * @param {string} mobileNo - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isMobileNoTaken = async function isMobileNoTaken(
  this: UserModel,
  mobileNo: string,
  excludeUserId: string
): Promise<boolean> {
  const user = await this.findOne({ mobileNo, _id: { $ne: excludeUserId } });
  return !!user;
};
/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */

userSchema.methods.isPasswordMatch = async function isPasswordMatch(
  this: Document,
  password: string
): Promise<boolean> {
  // Method implementation
  return bcrypt.compare(password, this.get("password") as string);
};

userSchema.pre(
  "save",
  async function saveMiddleware(this: UserProfile, next: () => void) {
    if (this.password && this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 8);
    }
    next();
  }
);

const User = mongoose.model<UserProfile, UserModel>("User", userSchema);

export default User;
