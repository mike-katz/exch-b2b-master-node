import profileController from "./activity.controller";
import profileValidation from "./activity.validation";

export interface IActivityRouteDetails {
  key: string;
  method: "get";
  url: string;
  auth?: string;
  validationMethodName?: keyof typeof profileValidation;
  controllerMethodName: keyof typeof profileController;
}

const routeDetails: IActivityRouteDetails[] = [
  {
    key: "fetchActivityAPI",
    method: "get",
    url: "/",
    validationMethodName: "fetchActivity",
    controllerMethodName: "fetchActivity",
    auth: "",
  },
];

export default routeDetails;
