import profileController from "./beating.controller";
import profileValidation from "./beating.validation";

export interface IBettingRouteDetails {
  key: string;
  method: "post" |"get";
  url: string;
  auth?: string;
  validationMethodName?: keyof typeof profileValidation;
  controllerMethodName: keyof typeof profileController;
}

const routeDetails: IBettingRouteDetails[] = [
  {
    key: "fetchBettingHistoryAPI",
    method: "get",
    url: "/history",
    validationMethodName: "bettingHistory",
    controllerMethodName: "bettingHistory",
    auth: "",
  },

  {
    key: "fetchBettingProfitLossAPI",
    method: "post",
    url: "/profit-loss",
    validationMethodName: "profitLoss",
    controllerMethodName: "profitLoss",
    auth: "",
  },

  {
    key: "fetchTransactionAPI",
    method: "post",
    url: "/transaction",
    validationMethodName: "transaction",
    controllerMethodName: "transaction",
    auth: "",
  },

  {
    key: "fetchSportsAPI",
    method: "get",
    url: "/get-sports",
    validationMethodName: "getSports",
    controllerMethodName: "getSports",    
  },

  {
    key: "getBetListAPI",
    method: "get",
    url: "/list",
    validationMethodName: "betList",
    controllerMethodName: "betList",    
    auth: "",
  },
];

export default routeDetails;
