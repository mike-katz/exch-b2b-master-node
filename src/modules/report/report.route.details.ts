import profileController from "./report.controller";
import profileValidation from "./report.validation";

export interface IReportRouteDetails {
  key: string;
  method: "get";
  url: string;
  auth?: string;
  validationMethodName?: keyof typeof profileValidation;
  controllerMethodName: keyof typeof profileController;
}

const routeDetails: IReportRouteDetails[] = [
 
  {
    key: "fetchCasinoTotalPLAPI",
    method: "get",
    url: "/casino/total-pl",
    validationMethodName: "fetchSportTotalPL",
    controllerMethodName: "fetchCasinoTotalPL",
    auth: "",
  },

  {
    key: "fetchIntCasinoTotalPLAPI",
    method: "get",
    url: "/intCasino/total-pl",
    validationMethodName: "fetchSportTotalPL",
    controllerMethodName: "fetchIntCasinoTotalPL",
    auth: "",
  },

  //sport
  {
    key: "fetchSportTotalPLAPI",
    method: "get",
    url: "/sport/total-pl",
    validationMethodName: "fetchSportTotalPL",
    controllerMethodName: "fetchSportTotalPL",
    auth: "",
  },

  {
    key: "fetchEventTotalPLAPI",
    method: "get",
    url: "/sport/list",
    validationMethodName: "fetchSportEventList",
    controllerMethodName: "fetchSportEventList",
    auth: "",
  },

  //aviator
  {
    key: "fetchAviatorTotalPLAPI",
    method: "get",
    url: "/aviator/total-pl",
    validationMethodName: "fetchSportTotalPL",
    controllerMethodName: "fetchAviatorTotalPL",
    auth: "",
  },

  {
    key: "fetchAviatorListAPI",
    method: "get",
    url: "/aviator/list",
    validationMethodName: "fetchAviatorList",
    controllerMethodName: "fetchAviatorList",
    auth: "",
  },
  {
    key: "fetchAviatorListAPI",
    method: "get",
    url: "/intCasino/list",
    validationMethodName: "fetchIntCasinoList",
    controllerMethodName: "fetchIntCasinoList",
    auth: "",
  },
  {
    key: "fetchUserWiseListAPI",
    method: "get",
    url: "/user/list",
    validationMethodName: "fetchuserPLList",
    controllerMethodName: "fetchuserPLList",
    auth: "",
  },
  {
    key: "fetchAuraListAPI",
    method: "get",
    url: "/userEventsProfitlossAura",
    validationMethodName: "userEventsProfitlossAura",
    controllerMethodName: "userEventsProfitlossAura",
    auth: "",
  },
  {
    key: "fetchAuraListAPI",
    method: "get",
    url: "/userMarketsProfitlossAura",
    validationMethodName: "userMarketsProfitlossAura",
    controllerMethodName: "userMarketsProfitlossAura",
    auth: "",
  }
];

export default routeDetails;
