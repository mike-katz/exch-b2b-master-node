import profileController from "./profile.controller";
import profileValidation from "./profile.validation";

export interface IAuthRouteDetails {
  key: string;
  method: "get";
  url: string;
  auth?: string;
  validationMethodName?: keyof typeof profileValidation;
  controllerMethodName: keyof typeof profileController;
}

const routeDetails: IAuthRouteDetails[] = [
  {
    key: "fetchUserProfileAPI",
    method: "get",
    url: "/user",
    validationMethodName: "fetchUserProfile",
    controllerMethodName: "fetchUserProfile",
    auth: "",
  },
];

export default routeDetails;
