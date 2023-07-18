import { JwtPayload } from "jsonwebtoken";
import mongoose, { Document, Model } from "mongoose";

import { ClientObject, UserProfile } from "./user.interfaces";

export interface IToken {
  token: string;
  user: string;
  type: string;
  expires: Date;
  blacklisted: boolean;
  provider: string;
  createdAt: Date;
  client: ClientObject;
}

export interface IDeviceToken {
  token: string;
  user?: mongoose.Types.ObjectId;
  blacklisted: boolean;
  createdAt: Date;
  client: ClientObject;
}
export interface IDeviceTokenDoc extends IDeviceToken, Document {}
export type IDeviceTokenModel = Model<IDeviceTokenDoc>;

export type NewToken = Omit<IToken, "blacklisted">;

export interface ITokenDoc extends IToken, Document {}

export type ITokenModel = Model<ITokenDoc>;

export interface IPayload extends JwtPayload {
  sub: string;
  iat: number;
  exp: number;
  type: string;
}

export interface TokenPayload {
  token: string;
  expires: Date;
}

export interface AccessAndRefreshTokens {
  access: TokenPayload;
  refresh: TokenPayload;
}
export interface IUserWithTokens {
  user: UserProfile;
  tokens: AccessAndRefreshTokens;
}
