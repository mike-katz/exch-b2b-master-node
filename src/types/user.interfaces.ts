import mongoose, { Document, Model, Schema } from "mongoose";

import { Options, QueryResult } from "@/models/plugins/paginate.plugin";
interface User {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  roles: [string];
  balance: Schema.Types.Decimal128;
  exposureLimit: Number;
  parentId: any;
  level: Number;
  commision: Number;
  mobile: string;
  origin: string;
  ip: string;
  refreshToken: string;  
  status: string;
  exposure: number;
  creditRef: number;
  parentStatus: string;
  managerId: Schema.Types.ObjectId;  
  isLocked: boolean;
  isActive: boolean;
  isCasino: boolean;
  isIntCasino: boolean;
  isSportBook: boolean;
  isAviator: boolean;
}

interface UserProfile extends User, Document {
  isPasswordMatch(password: string): Promise<boolean>;
  id: mongoose.Types.ObjectId;
}

interface UserModel extends Model<UserProfile> {
  isMobileNoTaken(mobile: string): Promise<boolean>;
  isUsernameTaken(
    username: string,
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
  mobile?: string;
  email?: string;
  otp?: number;
  password?: string;
}

export {
  IResetData,
  NewRegisteredUser,
  UpdateUserBody,
  User,
  UserModel,
  UserProfile,
  UserVarificationMode,
};
