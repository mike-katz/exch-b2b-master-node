import httpStatus from "http-status";
import catchAsync from "@/utils/catchAsync";
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
      "roles": data.roles, "username": data.username, "mobile": data.mobile, "accessToken": data.tokens.accessToken, "balance": data.balanceData, "status": data.status, "commission": data.commision
    };
    // console.log("response",{...response.data});
    res.status(httpStatus.OK).json(response);
  }
);




export {
  login,
  // changePwd
};
