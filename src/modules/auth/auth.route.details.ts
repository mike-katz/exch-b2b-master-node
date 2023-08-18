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
    key: "ChangePasswordAPI",
    method: "post",
    url: "/change-password",
    validationMethodName: "changePwd",
    controllerMethodName: "changePwd",
    auth: "",
  },
];

export default routeDetails;
