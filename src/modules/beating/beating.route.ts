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

import bettingController from "./beating.controller";
import routeDetails, { IBettingRouteDetails } from "./beating.route.details";
import bettingValidation from "./beating.validation";

const bettingRoute: Router = express.Router();

if (!isEmpty(routeDetails)) {
  forEach(routeDetails, (value: IBettingRouteDetails) => {
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
        validate(req, res, next, bettingValidation[value.validationMethodName]);
    };
    if (Object.prototype.hasOwnProperty.call(value, "validationMethodName")) {
      // check validation
      args.push(validateMiddleware);
    }

    route(bettingRoute, method, value.url, [
      ...args,
      bettingController[value.controllerMethodName],
    ]); // pass value.url as the first argument
  });
}
export default bettingRoute;
