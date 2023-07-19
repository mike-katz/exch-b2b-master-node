import { IncomingHttpHeaders } from "node:http";

import { Request } from "express";
import httpStatus from "http-status";
import mongoose from "mongoose";

import config from "@/config/config";
import { decryptData } from "@/config/encryption";
import * as TokenService from "@/service/token.service";
import { CustomResponse, IRoutePath } from "@/types";
import { NewRegisteredUser, UserProfile } from "@/types/user.interfaces";
import ApiError from "@/utils/ApiError";
import catchAsync from "@/utils/catchAsync";
import messages from "@/utils/messages";
import prepareResponse from "@/utils/prepareResponse";

import { ILoginBody, IRegisterBody } from "./auth.interfaces";
import * as AuthService from "./auth.service";

const {
  loginTypes,
  email: { verificationBy },
} = config;

const login = catchAsync(
  async (
    req: {
      route: IRoutePath;
      headers: IncomingHttpHeaders;
      body: ILoginBody;
    },
    res: CustomResponse
  ) => {
    const { email, password } = req.body; 
 const { user, tokens } = await AuthService.loginUser(
      email,
      password,
    );
    const response = prepareResponse({
      msg: "login success",
      data: { user, tokens },
    });
    res.status(httpStatus.OK).json(response);
  }
);

const register = catchAsync(
  async (
    req: { body: IRegisterBody },
    res: CustomResponse
  ) => {
    const userRegistration = await AuthService.createUser({
      ...req.body,
    } as NewRegisteredUser);
    res.status(httpStatus.CREATED).json(
      prepareResponse({
        msg: "Register success",
        data: userRegistration,
      })
    );
  }
);

const logout = catchAsync(
  async (
    req: {
      headers: IncomingHttpHeaders;
      body: { refreshToken: string; deviceToken?: string };
    },
    res: CustomResponse
  ) => {
    await AuthService.logout(
      req.body.refreshToken,
    );
    res.status(httpStatus.OK).json(
      prepareResponse({
        msg: messages.auth.LOGOUT_SUCCESSFULLY,
      })
    );
  }
);

//   async (req: CustomRequest, res: CustomResponse) => {

const fileUploadDemo = catchAsync(async () => {
  // await AuthService.fileUploadDemo(req);
  //   if (!req.files)
  //     throw new ApiError(httpStatus.BAD_REQUEST, {
  //       code: "UPLOAD FILE OR CHECK KEY",
  //     });
  //   await AuthService.fileUploadDemo(
  //     req?.files,
  //     req.body.status === "proposal"
  //   );
  //   res.status(httpStatus.OK).json(
  //     prepareResponse({
  //       code: messages.FILE_UPLOAD_SUCCESSFULLY,
  //     })
  //   );
});

const handleRefreshToken = catchAsync(
  async (req: { body: { refreshToken: string } }, res: CustomResponse) => {
    const { refreshToken } = req.body;
    const newAuthToken = await TokenService.refreshTokenService(refreshToken);
    res
      .status(httpStatus.OK)
      .json(
        prepareResponse({ msg: messages.SUCCESS, data: { newAuthToken } })
      );
  }
);

export {
  fileUploadDemo,
  handleRefreshToken,
  login,
  logout,
  register,  
};
