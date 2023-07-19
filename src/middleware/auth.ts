import { NextFunction, Request } from "express";
import { cloneDeep } from "lodash";
import passport, { AuthenticateCallback } from "passport";

import { socialLoginTypes } from "@/config/users";
import { User } from "@/models";
import { isSocialLogin } from "@/service/user.service";
import { CustomResponse, IRoutePath } from "@/types";
import { UserProfile } from "@/types/user.interfaces";
import ApiError from "@/utils/ApiError";
import messages from "@/utils/messages";

const isSocialAuthTypeValid = async (req: Request): Promise<void> => {
  const { path } = req.route as IRoutePath;
  if (isSocialLogin(path)) {
    const socialLoginType: string | undefined = Object.keys(
      socialLoginTypes
    ).find(type => path.includes(type));

    if (!socialLoginType) {
      throw new ApiError(401, {
        msg: messages.auth.INVALID_SOCAIL_LOGIN_TYPE,
      });
    }
  }
};

const verifyCallback =
  (req: Request, res: CustomResponse, next: NextFunction, type = "") =>
  async (err: Error, user: UserProfile, info: string) => {
    try {
      const userDetail = cloneDeep(user);
      if (err || info || !user) {
        // TODO this throw error in console not response
        throw new ApiError(401, { msg: messages.USER_UNAUTHORIZED });
      } else if (type !== "" && userDetail.authType !== type) {
        throw new ApiError(401, { msg: messages.USER_UNAUTHORIZED });
      } else {
        req.user = user;
        next();
      }
    } catch (error) {
      next(error);
    }
  };

const socialCallback =
  (req: Request, res: CustomResponse, next: NextFunction) =>
  async (
    err: Error | string,
    userData: UserProfile,
    info: string
  ): Promise<void> => {
    try {
      if (err || info || !userData) {
        if (err === messages.auth.EMAIL_NOT_FOUND) {
          throw new ApiError(401, { msg: err });
        }
        throw new ApiError(401, { msg: messages.USER_UNAUTHORIZED });
      }
      const user = await User.findOne({
        $and: [{ email: userData.email }, { isDeleted: false }],
      });
      if (req.url === "/login/google" || req.url === "/login/facebook") {
        if (user) {
          // update data
          const updatedUser = await User.findByIdAndUpdate(user.id, userData, {
            new: true,
          });
          if (updatedUser) {
            req.user = updatedUser;
            next();
          }
        } else {
          const newUser = await User.create(userData);
          req.user = newUser;
          next();
        }
      } else if (user) {
        req.user = user;
        next();
      } else {
        throw new ApiError(401, { msg: messages.USER_UNAUTHORIZED });
      }
    } catch (error) {
      next(error);
    }
  };

const socialAuth = async (
  type: string,
  req: Request,
  res: CustomResponse,
  next: NextFunction
): Promise<void> => {
  const passportAuthenticationCallback = passport.authenticate(
    type,
    { session: false },
    socialCallback(req, res, next)
  ) as AuthenticateCallback;

  passportAuthenticationCallback(req, res, next);
};

const handleAuth = async (
  req: Request,
  res: CustomResponse,
  next: NextFunction,
  type?: string
): Promise<void> => {
  try {
    const { authtype } = req.headers;
    if (authtype) {
      await isSocialAuthTypeValid(req);
      if (authtype === "facebook")
        await socialAuth("facebook-token", req, res, next);
      else if (authtype === "google")
        await socialAuth("google-token", req, res, next);
      else {
        throw new ApiError(401, { msg: messages.INVALID_REQUEST });
      }
    } else {
      const passportAuthenticationCallback = passport.authenticate(
        "jwt",
        { session: false },
        verifyCallback(req, res, next, type)
      ) as AuthenticateCallback;
      passportAuthenticationCallback(req, res, next);
    }
  } catch (error) {
    next(error);
  }
};

const auth = async (
  req: Request,
  res: CustomResponse,
  next: NextFunction,
  type: string | undefined
): Promise<void> => {
  await handleAuth(req, res, next, type);
};

const optionalAuth = async (
  req: Request,
  res: CustomResponse,
  next: NextFunction
): Promise<void> => {
  const token = req.headers.access_token;
  if (token && token !== "") {
    await handleAuth(req, res, next);
  } else {
    req.user = false;
    next();
  }
};

export { auth, isSocialAuthTypeValid, optionalAuth, socialAuth };
