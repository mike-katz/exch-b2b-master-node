import profileController from "./user.controller";
import profileValidation from "./user.validation";

export interface IAuthRouteDetails {
  key: string;
  method: "get" | "post";
  url: string;
  auth?: string;
  validationMethodName?: keyof typeof profileValidation;
  controllerMethodName: keyof typeof profileController;
}

const routeDetails: IAuthRouteDetails[] = [
  {
    key: "fetchUserProfileAPI",
    method: "get",
    url: "/detail",
    validationMethodName: "fetchUserProfile",
    controllerMethodName: "fetchUserProfile",
    auth: "",
  },

  {
    key: "fetchDownlineDataAPI",
    method: "post",
    url: "/downline",
    validationMethodName: "fetchUserDownline",
    controllerMethodName: "fetchUserDownline",
    auth: "",
  },
  
  {
    key: "RegisterAPI",
    method: "post",
    url: "/register",
    validationMethodName: "Register",
    controllerMethodName: "Register",
    auth: "",
  }, 
  
  {
    key: "MyDownlineAPI",
    method: "post",
    url: "/my-team",
    validationMethodName: "myDownline",
    controllerMethodName: "myDownline",
    auth: "",
  }, 

  {
    key: "AddCreditLogAPI",
    method: "post",
    url: "/add-creditlog",
    validationMethodName: "addCreditLog",
    controllerMethodName: "addCreditLog",
    auth: "",
  }, 

  {
    key: "GetCreditLogAPI",
    method: "post",
    url: "/creditlogs",
    validationMethodName: "getCreditLog",
    controllerMethodName: "getCreditLog",
    auth: "",
  }, 

  {
    key: "UpdateStatusAPI",
    method: "post",
    url: "/update-status",
    validationMethodName: "updateStatus",
    controllerMethodName: "updateStatus",
    auth: "",
  },

  {
    key: "searchAPI",
    method: "post",
    url: "/search",
    validationMethodName: "search",
    controllerMethodName: "search",
    auth: "",
  },

  {
    key: "exposureAPI",
    method: "post",
    url: "/change-exposure",
    validationMethodName: "updateStatus",
    controllerMethodName: "updateExposure",
    auth: "",
  },

    {
    key: "myBalanceAPI",
    method: "post",
    url: "/my-balance",
    validationMethodName: "myBalance",
    controllerMethodName: "myBalance",
    auth: "",
  },
];

export default routeDetails;
