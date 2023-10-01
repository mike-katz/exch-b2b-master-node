import profileController from "./pl.controller";
import profileValidation from "./pl.validation";

export interface IPLRouteDetails {
  key: string;
  method: "get";
  url: string;
  auth?: string;
  validationMethodName?: keyof typeof profileValidation;
  controllerMethodName: keyof typeof profileController;
}

const routeDetails: IPLRouteDetails[] = [
  {
    key: "fetchMarketAPI",
    method: "get",
    url: "/userSportsProfitloss",
    validationMethodName: "userSportsProfitloss",
    controllerMethodName: "userSportsProfitloss",
    auth: "",
  },
  {
    key: "fetchMarketAPI",
    method: "get",
    url: "/userEventsProfitloss",
    validationMethodName: "userSportsProfitloss",
    controllerMethodName: "userEventsProfitloss",
    auth: "",
  },
  {
    key: "fetchMarketAPI",
    method: "get",
    url: "/userMarketsProfitloss",
    validationMethodName: "userSportsProfitloss",
    controllerMethodName: "userMarketsProfitloss",
    auth: "",
  },

  {
    key: "fetchMarketAPI",
    method: "get",
    url: "/aviator/total",
    validationMethodName: "userSportsProfitloss",
    controllerMethodName: "aviatorSumOfPl",
    auth: "",
  },
  {
    key: "fetchMarketAPI",
    method: "get",
    url: "/aviator",
    validationMethodName: "userSportsProfitloss",
    controllerMethodName: "aviatorPl",
    auth: "",
  },

  {
    key: "fetchMarketAPI",
    method: "get",
    url: "/st8/getCategoryTotalPL",
    validationMethodName: "userSportsProfitloss",
    controllerMethodName: "getCategoryTotalPL",
    auth: "",
  },

  {
    key: "fetchMarketAPI",
    method: "get",
    url: "/st8/getCategories",
    validationMethodName: "userSportsProfitloss",
    controllerMethodName: "getCategoryList",
    auth: "",
  },

  {
    key: "fetchMarketAPI",
    method: "get",
    url: "/st8/getGameList",
    validationMethodName: "userSportsProfitloss",
    controllerMethodName: "getGameList",
    auth: "",
  },

  {
    key: "fetchMarketAPI",
    method: "get",
    url: "/userSportsProfitlossAura",
    validationMethodName: "userSportsProfitloss",
    controllerMethodName: "userSportsProfitlossAura",
    auth: "",
  },

  {
    key: "fetchMarketAPI",
    method: "get",
    url: "/userEventsProfitlossAura",
    validationMethodName: "userSportsProfitloss",
    controllerMethodName: "userEventsProfitlossAura",
    auth: "",
  },
  {
    key: "fetchMarketAPI",
    method: "get",
    url: "/userMarketsProfitlossAura",
    validationMethodName: "userSportsProfitloss",
    controllerMethodName: "userMarketsProfitlossAura",
    auth: "",
  },
  {
    key: "fetchMarketAPI",
    method: "get",
    url: "/getUserBetListAura",
    validationMethodName: "userSportsProfitloss",
    controllerMethodName: "getUserBetListAura",
    auth: "",
  },

  {
    key: "fetchMarketAPI",
    method: "get",
    url: "/getUserBetList",
    validationMethodName: "userSportsProfitloss",
    controllerMethodName: "getUserBetList",
    auth: "",
  },
];

export default routeDetails;
