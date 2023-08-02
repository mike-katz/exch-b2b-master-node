import profileController from "./beating.controller";
import profileValidation from "./beating.validation";

export interface IBettingRouteDetails {
  key: string;
  method: "post";
  url: string;
  auth?: string;
  validationMethodName?: keyof typeof profileValidation;
  controllerMethodName: keyof typeof profileController;
}

const routeDetails: IBettingRouteDetails[] = [
  {
    key: "fetchBettingHistoryAPI",
    method: "post",
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
];

export default routeDetails;
