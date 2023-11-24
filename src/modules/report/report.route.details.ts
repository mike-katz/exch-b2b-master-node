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
];

export default routeDetails;
