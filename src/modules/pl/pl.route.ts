import express, {
  NextFunction,
  Request,
  RequestHandler,
  Router,
} from "express";
import { forEach, has, isEmpty, toLower } from "lodash";

import auth from "@/middleware/auth";
import validate from "@/middleware/validate";
import { CustomResponse } from "@/types";
import route from "@/utils/routeRegister";

import marketController from "./pl.controller";
import routeDetails, { IPLRouteDetails } from "./pl.route.details";
import marketValidation from "./pl.validation";

const marketRoute: Router = express.Router();

if (!isEmpty(routeDetails)) {
  forEach(routeDetails, (value: IPLRouteDetails) => {
    const method = toLower(value.method);
    let args: RequestHandler[] = [];

    if (Object.prototype.hasOwnProperty.call(value, "auth")) {
      args = [auth];
    }
    
    const validateMiddleware: RequestHandler = (
      req: Request,
      res: CustomResponse,
      next: NextFunction
    ): void => {
      if (value.validationMethodName)
        validate(req, res, next, marketValidation[value.validationMethodName]);
    };
    if (Object.prototype.hasOwnProperty.call(value, "validationMethodName")) {
      // check validation
      args.push(validateMiddleware);
    }

    route(marketRoute, method, value.url, [
      ...args,
      marketController[value.controllerMethodName],
    ]); // pass value.url as the first argument
  });
}
export default marketRoute;
