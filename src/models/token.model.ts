import mongoose from "mongoose";

import tokenTypes from "@/config/tokens";
import { socialLoginTypes, userPlatform } from "@/config/users";
import { ITokenDoc, ITokenModel } from "@/types/token.interfaces";

import { toJSON } from "./plugins";

const tokenSchema = new mongoose.Schema<ITokenDoc, ITokenModel>(
  {
    token: {
      type: String,
      required: true,
      index: true,
    },
    user: {
      type: String,
      ref: "User",
      required: true,
    },
    
    type: {
      type: String,
      enum: [
        tokenTypes.ACCESS,
        tokenTypes.REFRESH,
        tokenTypes.RESET_PASSWORD,
        tokenTypes.VERIFY_EMAIL,
      ],
      required: true,
    },
    expires: {
      type: Date,
      required: true,
    },
    provider: {
      type: String,
      enum: [
        socialLoginTypes.apple,
        socialLoginTypes.facebook,
        socialLoginTypes.google,
        "local",
      ],
      required: true,
      default: "local",
    },
    blacklisted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
tokenSchema.plugin(toJSON);

const Token = mongoose.model<ITokenDoc, ITokenModel>("Token", tokenSchema);

export default Token;
