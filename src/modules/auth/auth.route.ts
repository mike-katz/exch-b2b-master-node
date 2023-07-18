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

import * as authController from "./auth.controller";
import routeDetails, { IAuthRouteDetails } from "./auth.route.details";
import * as authValidation from "./auth.validation";

const authRoute: Router = express.Router();

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
        validate(req, res, next, authValidation[value.validationMethodName]);
    };
    if (has(value, "validationMethodName")) {
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

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               mobileNo:
 *                 type: string
 *                 format: string
 *               countryCode:
 *                 type: string
 *                 format: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               captchaToken:
 *                 type: string
 *             example:
 *               email: email address here
 *               password: Test$$123456
 *               captchaToken: captchaToken
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
 *       "401":
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               code: 401
 *               message: Invalid email or password
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register
 *     tags: [Auth]
 *     security:
 *       - clientAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - authType
 *               - email
 *               - password
 *               - captchaToken
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               captchaToken:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               mobileNo:
 *                 type: string
 *               countryCode:
 *                 type: string
 *               authType:
 *                 type: string
 *             example:
 *               email: email address here
 *               password: Test$$123456
 *               captchaToken: captchaToken
 *               firstName: firstName
 *               lastName: lastName
 *               mobileNo: ""
 *               countryCode: "91"
 *               authType: authType
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
 *       "401":
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               code: 401
 *               message: Invalid email or password
 */

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Verify Email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *             example:
 *               token: token
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
 *       "401":
 *         description: Invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               code: 401
 *               message: Invalid token
 */

/**
 * @swagger
 * /auth/send-verification-email:
 *   post:
 *     summary: Send Verification Email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - type
 *               - captchaToken
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               type:
 *                 type: string
 *               captchaToken:
 *                 type: string
 *             example:
 *               email: email address here
 *               type: forgot/reset
 *               captchaToken: captchaToken
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
 *       "401":
 *         description: Invalid email or type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               code: 401
 *               message: Invalid email or type
 */

/**
 * @swagger
 * /auth/get-verification-code:
 *   post:
 *     summary: Get Verification Code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mobileNo
 *             properties:
 *               mobileNo:
 *                 type: string
 *             example:
 *               mobileNo: ""
 *     responses:
 *       "204":
 *         description: No content
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *             example:
 *               refreshToken: "[INSERT_REFRESH_TOKEN]"
 *     responses:
 *       "204":
 *         description: No content
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password
 *     description: An email will be sent to reset password. / add otp recevied by forgot password and add new password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - source
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               token:
 *                 type: string
 *                 format: string
 *               mobileNo:
 *                 type: string
 *                 format: string
 *               countryCode:
 *                 type: string
 *                 format: string
 *               otp:
 *                 type: number
 *                 format: number
 *               password:
 *                 type: string
 *                 format: string
 *             example:
 *               source: EMAIL
 *               email: email address here
 *               password: password
 *               otp: 2345
 *     responses:
 *       "200":
 *         description: Password Reset successfully
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Forgot password
 *     description: send otp on Phone/email
 *     tags: [Auth]
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
 *               email:
 *                 type: string
 *                 format: email
 *               mobileNo:
 *                 type: string
 *                 format: string
 *               countryCode:
 *                 type: string
 *                 format: string
 *             example:
 *               source: EMAIL
 *               email: email address here
 *     responses:
 *       "200":
 *         description: OTP sent successfully
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
