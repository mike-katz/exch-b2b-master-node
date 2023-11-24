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
    key: "fetchSportTotalPLAPI",
    method: "get",
    url: "/sport/total-pl",
    validationMethodName: "fetchSportTotalPL",
    controllerMethodName: "fetchSportTotalPL",
    auth: "",
  },

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

  {
    key: "fetchAviatorTotalPLAPI",
    method: "get",
    url: "/aviator/total-pl",
    validationMethodName: "fetchSportTotalPL",
    controllerMethodName: "fetchAviatorTotalPL",
    auth: "",
  }
];

export default routeDetails;
