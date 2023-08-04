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
    method: "post",
    url: "/detail",
    validationMethodName: "fetchUserProfile",
    controllerMethodName: "fetchUserProfile",
    auth: "",
  },

  {
    key: "fetchDownlineDataAPI",
    method: "get",
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
    method: "get",
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
    key: "exposureAPI",
    method: "post",
    url: "/change-exposure",
    validationMethodName: "updateStatus",
    controllerMethodName: "updateExposure",
    auth: "",
  },

  {
    key: "myBalanceAPI",
    method: "get",
    url: "/my-balance",
    validationMethodName: "myBalance",
    controllerMethodName: "myBalance",
    auth: "",
  },
    
  {
    key: "exportAPI",
    method: "post",
    url: "/export",
    validationMethodName: "exportCsv",
    controllerMethodName: "exportCsv",
    auth: "",
  },
];

export default routeDetails;
