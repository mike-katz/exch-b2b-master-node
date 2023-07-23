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

import * as authController from "./auth.controller";
import routeDetails, { IAuthRouteDetails } from "./auth.route.details";
import * as authValidation from "./auth.validation";

const authRoute: Router = express.Router();

if (!isEmpty(routeDetails)) {
  forEach(routeDetails, (value: IAuthRouteDetails) => {
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
        validate(req, res, next, authValidation[value.validationMethodName]);
    };
    if (Object.prototype.hasOwnProperty.call(value, "validationMethodName")) {
      // check validation
      args.push(validateMiddleware);
    }

    route(authRoute, method, value.url, [
      ...args,
      authController[value.controllerMethodName],
    ]); // pass value.url as the first argument
  });
}
export default authRoute;
