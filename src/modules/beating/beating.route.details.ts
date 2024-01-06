import profileController from "./beating.controller";
import profileValidation from "./beating.validation";

export interface IBettingRouteDetails {
  key: string;
  method: "post" | "get";
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

  {
    key: "getMatchBetAPI",
    method: "get",
    url: "/matchBet",
    validationMethodName: "matchBet",
    controllerMethodName: "matchBet",
    auth: "",
  },

  {
    key: "getBetPLAPI",
    method: "get",
    url: "/pl",
    validationMethodName: "betPL",
    controllerMethodName: "betPL",
    auth: "",
  },
  {
    key: "getBetPLAPI",
    method: "get",
    url: "/plFancy",
    validationMethodName: "betPLFancy",
    controllerMethodName: "betPLFancy",
    auth: "",
  },

 {
    key: "saveBetLockAPI",
    method: "post",
    url: "/lock",
    validationMethodName: "betLock",
    controllerMethodName: "betLock",
    auth: "",
  },

  {
    key: "getBetLockLogAPI",
    method: "get",
    url: "/betLocklog",
    validationMethodName: "betLockLog",
    controllerMethodName: "betLockLog",
    auth: "",
  },

  {
    key: "getLastTwentyRecordAPI",
    method: "get",
    url: "/latestBet",
    validationMethodName: "getLatestBet",
    controllerMethodName: "getLatestBet",
    auth: "",
  },

  {
    key: "getmarketBetAPI",
    method: "get",
    url: "/market-pl",
    validationMethodName: "marketPL",
    controllerMethodName: "marketPL",
    auth: "",
  },

  {
    key: "getmarketBetAPI",
    method: "get",
    url: "/market-pl-new",
    validationMethodName: "marketPL",
    controllerMethodName: "marketPLNew",
    auth: "",
  },

];

export default routeDetails;
