import profileController from "./market.controller";
import profileValidation from "./market.validation";

export interface IMarketRouteDetails {
  key: string;
  method: "get";
  url: string;
  auth?: string;
  validationMethodName?: keyof typeof profileValidation;
  controllerMethodName: keyof typeof profileController;
}

const routeDetails: IMarketRouteDetails[] = [
  {
    key: "fetchMarketAPI",
    method: "get",
    url: "/",
    validationMethodName: "fetchMarket",
    controllerMethodName: "fetchMarket",
    auth: "",
  },
];

export default routeDetails;
