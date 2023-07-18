import * as otpController from "./otp.controller";
import * as otpValidation from "./otp.validation";

export interface IOTPRouteDetails {
  key: string;
  method: "get" | "post" | "put" | "delete";
  url: string;
  auth?: string;
  validationMethodName?: keyof typeof otpValidation;
  controllerMethodName: keyof typeof otpController;
}

const routeDetails: IOTPRouteDetails[] = [
  {
    key: "sendOtpAPI",
    method: "post",
    url: "/send",
    validationMethodName: "sendOtp",
    controllerMethodName: "sendOtp",
  },
  {
    key: "resendOtpAPI",
    method: "post",
    url: "/resend",
    validationMethodName: "sendOtp",
    controllerMethodName: "sendOtp",
  },
  {
    key: "verifyOtpAPI",
    method: "post",
    url: "/verify",
    validationMethodName: "verifyOtp",
    controllerMethodName: "verifyOtp",
  },
];

export default routeDetails;
