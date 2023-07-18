export interface IUserOtpData {
  nextOtpTime: string;
  otp: number;
  sentOtpCount: number;
  otpTime: string;
}

export interface ISendOtpRes {
  to: string;
  otpToken: string;
}

export interface IOtpReqestData {
  source: string;
  countryCode?: string | undefined;
  mobileNo?: string | undefined;
  email?: string | undefined;
  otp?: number;
}

export interface ISendOtpBody {
  countryCode: string;
  mobileNo: string;
  email: string;
  source: string;
}

export interface IVerifyOtpBody {
  countryCode: string;
  mobileNo: string;
  email: string;
  otp: number;
  source: string;
}
