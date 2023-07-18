import mongoose, { Document, Model } from "mongoose";

import { Options, QueryResult } from "@/models/plugins/paginate.plugin";

interface ClientObject {
  bundleId: string;
  platform: string;
  hardware: string;
  product: string;
  softwareName: string;
  softwareVersion: string;
  version: string;
  buildNumber: string;
  ip: string;
  route: string;
}
interface User {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userRole: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  lastLoginDateTime: Date;
  isDeleted: boolean;
  captchaToken: string;
  mobileNo: string;
  countryCode: string;
  client: ClientObject;
  authType: string;
  otp: number;
  otpTime: Date;
  otpStatus: string;
  nextOtpTime: string;
  sentOtpCount: number;
  googleId: string;
  facebookId: string;
  appleId: string;
}

interface UserProfile extends User, Document {
  isPasswordMatch(password: string): Promise<boolean>;
  id: mongoose.Types.ObjectId;
}

interface UserModel extends Model<UserProfile> {
  isMobileNoTaken(mobileNo: string): Promise<boolean>;
  isEmailTaken(
    email: string,
    excludeUserId?: mongoose.Types.ObjectId
  ): Promise<boolean>;
  paginate(
    filter: Record<string, null>,
    options: Options
  ): Promise<QueryResult>;
}

type NewRegisteredUser = Omit<
  User,
  "userRole" | "isEmailVerified" | "lastLoginDateTime" | "isDeleted"
>;

type UpdateUserBody = Partial<User>;

enum UserVarificationMode {
  NORMAL = "NORMAL",
  STRICT = "STRICT",
}

interface IResetData {
  source: string;
  countryCode?: string;
  mobileNo?: string;
  email?: string;
  otp?: number;
  password?: string;
}

export {
  ClientObject,
  IResetData,
  NewRegisteredUser,
  UpdateUserBody,
  User,
  UserModel,
  UserProfile,
  UserVarificationMode,
};
