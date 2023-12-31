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
    method: "get",
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
  
  {
    key: "getParentUsernameAPI",
    method: "get",
    url: "/get-parentList",
    validationMethodName: "getParentUsername",
    controllerMethodName: "getParentUsername",
    auth: "",
  },

  {
    key: "UpdateProfileAPI",
    method: "post",
    url: "/update-profile",
    validationMethodName: "updateProfile",
    controllerMethodName: "updateProfile",
    auth: "",
  },

  {
    key: "GetProfileLogAPI",
    method: "get",
    url: "/profile-log",
    validationMethodName: "profileLog",
    controllerMethodName: "profileLog",
    auth: "",
  },
  {
    key: "GetExposureListAPI",
    method: "get",
    url: "/exposure-list",
    validationMethodName: "exposureList",
    controllerMethodName: "exposureList",
    auth: "",
  },
  {
    key: "GetUserBetListAPI",
    method: "get",
    url: "/get-user-bet-list",
    validationMethodName: "getUserBetList",
    controllerMethodName: "getUserBetList",
    auth: "",
  },
];

export default routeDetails;
