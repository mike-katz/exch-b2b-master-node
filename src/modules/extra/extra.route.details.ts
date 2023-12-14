import profileController from "./extra.controller";
import profileValidation from "./extra.validation";

export interface IExtraRouteDetails {
  key: string;
  method: "get" | "post";
  url: string;
  auth?: string;
  validationMethodName?: keyof typeof profileValidation;
  controllerMethodName: keyof typeof profileController;
}

const routeDetails: IExtraRouteDetails[] = [
  {
    key: "submitNewsAPI",
    method: "post",
    url: "/news",
    validationMethodName: "saveNews",
    controllerMethodName: "saveNews",
    auth: "",
  }, 
  {
    key: "getThemeAPI",
    method: "post",
    url: "/theme",
    validationMethodName: "getThemes",
    controllerMethodName: "getThemes",
    // auth: "",
  }, 
  {
    key: "getSpredexIdAPI",
    method: "get",
    url: "/fetch-scoreboard",
    validationMethodName: "getSpredexIds",
    controllerMethodName: "getSpredexIds",
    // auth: "",
  }, 
];

export default routeDetails;
