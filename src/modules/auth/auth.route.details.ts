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
    key: "registerAPI",
    method: "post",
    url: "/register",
    validationMethodName: "register",
    controllerMethodName: "register",
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
];

export default routeDetails;
