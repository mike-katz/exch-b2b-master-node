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

import activityController from "./activity.controller";
import routeDetails, { IActivityRouteDetails } from "./activity.route.details";
import activityValidation from "./activity.validation";

const activityRoute: Router = express.Router();

if (!isEmpty(routeDetails)) {
  forEach(routeDetails, (value: IActivityRouteDetails) => {
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
        validate(req, res, next, activityValidation[value.validationMethodName]);
    };
    if (Object.prototype.hasOwnProperty.call(value, "validationMethodName")) {
      // check validation
      args.push(validateMiddleware);
    }

    route(activityRoute, method, value.url, [
      ...args,
      activityController[value.controllerMethodName],
    ]); // pass value.url as the first argument
  });
}
export default activityRoute;
