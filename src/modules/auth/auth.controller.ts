import httpStatus from "http-status";
import catchAsync from "@/utils/catchAsync";
import { ILoginBody } from "./auth.interfaces";
import * as AuthService from "./auth.service";
import { Request } from "express";
import { CustomResponse } from "@/types";
import prepareResponse from "@/utils/prepareResponse";
import ApiError from "@/utils/ApiError";

const login = catchAsync(
  async (
    req: {
      body: ILoginBody;
      headers: any;
    },
    res: any
  ) => {
    const origin = req.headers['origin'];
    if (!origin) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "Origin header not found in the request",
      });
    }
  
    const { username, password, ip } = req.body;
    const data: any = await AuthService.loginUser(
      username,
      password,
      ip,
      origin
    );

    const response = {
      message: "login success",
      "roles": data.roles, "username": data.username, "mobile": data.mobile, "accessToken": data.tokens.accessToken, "balance": data.balanceData, "status": data.status, "commission": data.commision
    };
    // console.log("response",{...response.data});
    res.status(httpStatus.OK).json(response);
  }
);


  const changePwd = catchAsync(
  async (req: Request, res: CustomResponse) => {
    const { oldPassword,newPassword } = req.body;
      const data ={}
        await AuthService.changePwd(oldPassword, newPassword, req.user);
    const response = prepareResponse({
      message: "Password change successfully.",
      data,
    });
    res.status(httpStatus.OK).json(response);
  }
);
export {
  login,
  changePwd
};
