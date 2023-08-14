
import bcrypt from "bcryptjs";
import mongoose, { Types, Schema } from "mongoose";
import { roles } from "@/config/roles";
import { UserModel, UserProfile } from "@/types/user.interfaces";
import * as plugin from "./plugins";
import { userStatus } from "@/config/users";

const b2cuserSchema = new mongoose.Schema<UserProfile, UserModel>(
  {
    firstName: { type: String },

    lastName: { type: String },

    username: { type: String, required: true },
    password: {
      type: String,
      minlength: 8,
      trim: true,
      required: true,
      private: true,
    },
    // password: {
    //   type: String,
    //   required: false,
    //   trim: true,
    //   minlength: 5,
    //   validate(value: string): void {
    //     if (!/\d/.test(value) || !/[A-Za-z]/.test(value)) {
    //       throw new Error(
    //         "Password must contain at least one letter and one number"
    //       );
    //     }
    //   },
    //   private: true, // used by the toJSON plugins
    // },

    mobile: {
      type: String,
      trim: true,
    },

    balance: {
      type: Schema.Types.Decimal128,
      default: 0,
    },

    roles: {
      type: [String],
      enum: roles,
    },

    exposureLimit: {
      type: Number,
      default: 0,
    },

    parentId: [{
      type: String,
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
    status: {
      type: String,
      enum: userStatus,
      default: userStatus.active,
    },
    exposure: {
      type: String,
    },  
    creditRef: {
      type: Number,
    },
    parentStatus:{
      type: String,
      enum: userStatus,
      default: userStatus.active,
    },
    managerId: {
      type: Types.ObjectId,
    },
    isActive:{
    type:Boolean
    },
    isLocked:{
    type:Boolean
    },
  },
  { timestamps: true }
);
// add plugin that converts mongoose to json
b2cuserSchema.plugin(plugin.toJSON);
b2cuserSchema.plugin(plugin.paginate);

const B2cuser = mongoose.model<UserProfile, UserModel>("B2cuser", b2cuserSchema);

export default B2cuser;
