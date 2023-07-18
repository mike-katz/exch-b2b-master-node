import * as authController from "./auth.controller";
import * as authValidation from "./auth.validation";

export interface IAuthRouteDetails {
  key: string;
  method: "get" | "post" | "put" | "delete";
  url: string;
  auth?: string;
  validationMethodName?: keyof typeof authValidation;
  controllerMethodName: keyof typeof authController;
}

const routeDetails: IAuthRouteDetails[] = [
  {
    key: "loginAPI",
    method: "post",
    url: "/login",
    validationMethodName: "login",
    controllerMethodName: "login",
    // auth: "",
  },
  {
    key: "AdminloginAPI",
    method: "post",
    url: "/admin/login",
    validationMethodName: "login",
    controllerMethodName: "login",
  },
  {
    key: "googleLoginAPI",
    method: "post",
    url: "/login/google",
    controllerMethodName: "socialLogin",
  },
  {
    key: "facebookLoginAPI",
    method: "post",
    url: "/login/facebook",
    controllerMethodName: "socialLogin",
  },
  {
    key: "appleLoginAPI",
    method: "post",
    url: "/login/apple",
    controllerMethodName: "socialLogin",
  },
  {
    key: "registerAPI",
    method: "post",
    url: "/register",
    validationMethodName: "register",
    controllerMethodName: "register",
  },
  {
    key: "verifyEmailAPI",
    method: "post",
    url: "/verify-email",
    validationMethodName: "verifyEmail",
    controllerMethodName: "verifyEmail",
  },
  {
    key: "sendVerificationAPI",
    method: "post",
    url: "/send-verification-email",
    validationMethodName: "sendVerificationEmail",
    controllerMethodName: "sendVerificationEmail",
  },
  {
    key: "resetPasswordAPI",
    method: "post",
    url: "/reset-password",
    validationMethodName: "resetPassword",
    controllerMethodName: "resetPassword",
  },
  {
    key: "forgotPasswordAPI",
    method: "post",
    url: "/forgot-password",
    validationMethodName: "forgotPassword",
    controllerMethodName: "forgotPassword",
  },
  {
    key: "getVerificationCodeAPI",
    method: "post",
    url: "/get-verification-code",
    validationMethodName: "getVerificationCode",
    controllerMethodName: "getVerificationCode",
  },
  {
    key: "logoutAPI",
    method: "post",
    url: "/logout",
    validationMethodName: "logout",
    controllerMethodName: "logout",
  },
  {
    key: "fileUploadDemoAPI",
    method: "post",
    url: "/fileUploadDemo",
    controllerMethodName: "fileUploadDemo",
  },
  {
    key: "refreshTokenAPI",
    method: "post",
    url: "/refresh-token",
    validationMethodName: "refreshToken",
    controllerMethodName: "handleRefreshToken",
  },
  {
    key: "updateDeviceTokenAPI",
    method: "put",
    url: "/update-device-token",
    validationMethodName: "updateDeviceToken",
    controllerMethodName: "updateDeviceToken",
  },
];

export default routeDetails;
