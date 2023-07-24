// const mongoose = require("mongoose");
// import { isEmail } from "validator";
import bcrypt from "bcryptjs";
import mongoose, { Document, Schema } from "mongoose";
import validator from "validator";

import { roles } from "@/config/roles";
import { userPlatform } from "@/config/users";
import { UserModel, UserProfile } from "@/types/user.interfaces";

import * as plugin from "./plugins";

const userSchema = new mongoose.Schema<UserProfile, UserModel>(
  {
    firstName: { type: String },

    lastName: { type: String },

    username: { type: String, required: true },

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

    mobile: {
      type: String,
      trim: true,
    },

    balance: {
      type: Schema.Types.Decimal128,
      default: 0,
    },

    roles: {
      type: String,
      enum: roles,
      default: "User",
    },

    exposureLimit: {
      type: Number,
      default: 0,
    },

    parentId: [{
      type: Number,
    }],
    level: {
      type: Number,
    },
    commision: {
      type: Number,
    },
    origin: {
      type: String,
    },
    ip: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
    commission: {
      type: String,      
    }
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
userSchema.statics.isUsernameTaken = async function isUsernameTaken(
  this: UserModel,
  email: string,
  excludeUserId: string
): Promise<boolean> {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if mobileNo is taken
 * @param {string} mobile - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isMobileNoTaken = async function isMobileNoTaken(
  this: UserModel,
  mobile: string,
  excludeUserId: string
): Promise<boolean> {
  const user = await this.findOne({ mobile, _id: { $ne: excludeUserId } });
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
