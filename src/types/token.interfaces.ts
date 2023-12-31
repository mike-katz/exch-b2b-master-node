import { JwtPayload } from "jsonwebtoken";
import mongoose, { Document, Model } from "mongoose";
export interface IToken {
  token: string;
  user: string;
  type: string;
  expires: Date;
  blacklisted: boolean;
  provider: string;
  createdAt: Date;
}

export interface IDeviceToken {
  token: string;
  user?: mongoose.Types.ObjectId;
  blacklisted: boolean;
  createdAt: Date;
}
export interface IDeviceTokenDoc extends IDeviceToken, Document {}
export type IDeviceTokenModel = Model<IDeviceTokenDoc>;

export type NewToken = Omit<IToken, "blacklisted">;

export interface ITokenDoc extends IToken, Document {}

export type ITokenModel = Model<ITokenDoc>;

export interface IPayload extends JwtPayload {
  sub: string;
  roles: string;
  iat: number;
  exp: number;
  type: string;
}

export interface AccessAndRefreshTokens {
  accessToken: string;
  refreshToken: string;
}