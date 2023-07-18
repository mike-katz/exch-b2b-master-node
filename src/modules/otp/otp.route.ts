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

import * as otpController from "./otp.controller";
import routeDetails, { IOTPRouteDetails } from "./otp.route.details";
import * as otpValidation from "./otp.validation";

const otpRoute: Router = express.Router();

if (!isEmpty(routeDetails)) {
  forEach(routeDetails, (value: IOTPRouteDetails) => {
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
        validate(req, res, next, otpValidation[value.validationMethodName]);
    };
    if (has(value, "validationMethodName")) {
      // check validation
      args.push(validateMiddleware);
    }
    route(otpRoute, method, value.url, [
      ...args,
      otpController[value.controllerMethodName],
    ]); // pass value.url as the first argument
  });
}
export default otpRoute;

/**
 * @swagger
 * tags:
 *   name: OTP
 *   description: Otp Authentication
 */

/**
 * @swagger
 * /otp/send:
 *   post:
 *     summary: Send OTP
 *     tags: [OTP]
 *     security:
 *       - otpAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - source
 *             properties:
 *               source:
 *                 type: string
 *                 format: string
 *               countryCode:
 *                 type: string
 *                 format: string
 *               mobileNo:
 *                 type: string
 *                 format: string
 *               email:
 *                 type: string
 *             example:
 *               source: PHONE
 *               countryCode: "91"
 *               mobileNo: ""
 *               email: email address here
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 otp:
 *                   $ref: '#/components/schemas/Otp'
 *
 *       "401":
 *         description: User Not Found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               code: 401
 *               message: User Not Found
 */

/**
 * @swagger
 * /otp/resend:
 *   post:
 *     summary: Resend OTP
 *     tags: [OTP]
 *     security:
 *       - otpAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - source
 *             properties:
 *               source:
 *                 type: string
 *                 format: string
 *               countryCode:
 *                 type: string
 *                 format: string
 *               mobileNo:
 *                 type: string
 *                 format: string
 *               email:
 *                 type: string
 *             example:
 *               source: PHONE
 *               countryCode: "91"
 *               mobileNo: ""
 *               email: email address here
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 otp:
 *                   $ref: '#/components/schemas/Otp'
 *
 *       "401":
 *         description: User Not Found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               code: 401
 *               message: User Not Found
 */

/**
 * @swagger
 * /otp/verify:
 *   post:
 *     summary: Verify OTP
 *     tags: [OTP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *               - source
 *             properties:
 *               source:
 *                 type: string
 *                 format: string
 *               countryCode:
 *                 type: string
 *                 format: string
 *               mobileNo:
 *                 type: string
 *                 format: string
 *               email:
 *                 type: string
 *               otp:
 *                 type: number
 *             example:
 *               source: PHONE
 *               countryCode: "91"
 *               mobileNo: ""
 *               email: email address here
 *               otp: 3452
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 tokens:
 *                   $ref: '#/components/schemas/AuthTokens'
 *
 *       "401":
 *         description: Invalid OTP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               code: 401
 *               message: Invalid OTP
 */
