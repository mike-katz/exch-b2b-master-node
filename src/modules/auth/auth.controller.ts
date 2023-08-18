import { IncomingHttpHeaders } from "node:http";
import httpStatus from "http-status";

import * as TokenService from "@/service/token.service";
import { CustomResponse } from "@/types";

import catchAsync from "@/utils/catchAsync";
import messages from "@/utils/messages";
import prepareResponse from "@/utils/prepareResponse";

import { ILoginBody } from "./auth.interfaces";
import * as AuthService from "./auth.service";

const login = catchAsync(
  async (
    req: {
      body: ILoginBody;
    },
    res: any
  ) => {
    const { username, password, ip } = req.body;
    const data: any = await AuthService.loginUser(
      username,
      password,
      ip
    );

    const response = {
      message: "login success",
      "roles": data.roles, "username": data.username, "mobile": data.mobile, "accessToken": data.tokens.accessToken, "balance": data.balanceData, "status": data.status, "commision": data.commision
    };
    // console.log("response",{...response.data});
    res.status(httpStatus.OK).json(response);
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
        message: "logout successful",
      })
    );
  }
);


const handleRefreshToken = catchAsync(
  async (req: { body: { refreshToken: string } }, res: CustomResponse) => {
    const { refreshToken } = req.body;
    const newAuthToken = await TokenService.refreshTokenService(refreshToken);
    res
      .status(httpStatus.OK)
      .json(
        prepareResponse({ message: messages.SUCCESS, data: { newAuthToken } })
      );
  }
);

export {
  handleRefreshToken,
  login,
  logout,
};
