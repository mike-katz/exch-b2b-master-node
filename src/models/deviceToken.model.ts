import mongoose from "mongoose";

import { userPlatform } from "@/config/users";
import { IDeviceTokenDoc, IDeviceTokenModel } from "@/types/token.interfaces";

import { toJSON } from "./plugins";

const deviceTokenSchema = new mongoose.Schema<
  IDeviceTokenDoc,
  IDeviceTokenModel
>(
  {
    token: {
      type: String,
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: false,
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
deviceTokenSchema.plugin(toJSON);

const DeviceToken = mongoose.model<IDeviceTokenDoc, IDeviceTokenModel>(
  "DeviceToken",
  deviceTokenSchema
);

export default DeviceToken;
