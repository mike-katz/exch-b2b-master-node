import profileController from "./banking.controller";
import profileValidation from "./banking.validation";

export interface IActivityRouteDetails {
  key: string;
  method: "get" | "post";
  url: string;
  auth?: string;
  validationMethodName?: keyof typeof profileValidation;
  controllerMethodName: keyof typeof profileController;
}

const routeDetails: IActivityRouteDetails[] = [
  {
    key: "submitTransactionAPI",
    method: "post",
    url: "/transaction",
    validationMethodName: "saveTransaction",
    controllerMethodName: "saveTransaction",
    auth: "",
  },
  {
    key: "transactionHistoryAPI",
    method: "get",
    url: "/transaction-history",
    validationMethodName: "getTransaction",
    controllerMethodName: "getTransaction",
    auth: "",
  },
];

export default routeDetails;
