import express, {
  NextFunction,
  Request,
  RequestHandler,
  Router,
} from "express";
import { forEach, has, isEmpty, toLower } from "lodash";

import { auth, optionalAuth } from "@/middleware/auth";
import validate from "@/middleware/validate";
import { CustomResponse } from "@/types";
import route from "@/utils/routeRegister";

import profileController from "./profile.controller";
import routeDetails, { IAuthRouteDetails } from "./profile.route.details";
import profileValidation from "./profile.validation";

const profileRoute: Router = express.Router();

if (!isEmpty(routeDetails)) {
  forEach(routeDetails, (value: IAuthRouteDetails) => {
    const method = toLower(value.method);
    const middlewareAuth = has(value, "auth")
      ? async (
          req: Request,
          res: CustomResponse,
          next: NextFunction
        ): Promise<void> => {
          await auth(req, res, next, value?.auth);
        }
      : async (
          req: Request,
          res: CustomResponse,
          next: NextFunction
        ): Promise<void> => {
          await optionalAuth(req, res, next);
        };

    const args: RequestHandler[] = [middlewareAuth]; // add middlewareAuth as the first argument

    const validateMiddleware: RequestHandler = (
      req: Request,
      res: CustomResponse,
      next: NextFunction
    ): void => {
      if (value.validationMethodName)
        validate(req, res, next, profileValidation[value.validationMethodName]);
    };
    if (has(value, "validationMethodName")) {
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
