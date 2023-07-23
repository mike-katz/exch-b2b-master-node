import express, {
  NextFunction,
  Request,
  RequestHandler,
  Router,
} from "express";
import { forEach, isEmpty, toLower } from "lodash";

import auth from "@/middleware/auth";
import validate from "@/middleware/validate";
import { CustomResponse } from "@/types";
import route from "@/utils/routeRegister";

import profileController from "./user.controller";
import routeDetails, { IAuthRouteDetails } from "./user.route.details";
import profileValidation from "./user.validation";

const profileRoute: Router = express.Router();

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
        validate(req, res, next, profileValidation[value.validationMethodName]);
    };
    if (Object.prototype.hasOwnProperty.call(value, "validationMethodName")) {
      // check validation
      args.push(validateMiddleware);
    }

    route(profileRoute, method, value.url, [
      ...args,
      profileController[value.controllerMethodName],
    ]); // pass value.url as the first argument
  });
}
export default profileRoute;
