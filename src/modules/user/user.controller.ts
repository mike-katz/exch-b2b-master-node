import { Request } from "express";

import { CustomResponse } from "@/types";
import catchAsync from "@/utils/catchAsync";
import prepareResponse from "@/utils/prepareResponse";
import * as UserService from "./user.service";
import httpStatus from "http-status";
import pick from "@/utils/pick";

const fetchUserProfile = catchAsync(
  async (req: any, res: CustomResponse) => {
    const { userId } = req.query;
    const data = await UserService.accountDetail(userId, req.user);
    const response = prepareResponse({
      message: "User fetched success",
      data,
    });
    res.status(httpStatus.OK).json(response);
  }
);

const fetchUserDownline = catchAsync(
  async (req: any, res: CustomResponse) => {

    const filter = pick(req?.query, ["userId", "search", "status"]);
    const options = pick(req?.query, ["sortBy", "limit", "page"]);
    const data = await UserService.findDownline(req.user, filter, options);
    const response = prepareResponse({
      message: "User fetched success",
      data,
    });
    res.status(httpStatus.OK).json(response);
  }
);

const Register = catchAsync(
  async (req: Request, res: CustomResponse) => {
    await UserService.Register(req.body, req?.user);
    const response = prepareResponse({
      message: "User created successful",
      data: null,
    });
    res.status(httpStatus.CREATED).json(response);
  }
);

const myDownline = catchAsync(
  async (req: any, res: CustomResponse) => {
    const filter = pick(req?.query, ["search", "status"]);
    const options = pick(req?.query, ["sortBy", "limit", "page"]);
    const data = await UserService.myDownline(filter, options, req.user);
    const response = prepareResponse({
      message: "successful",
      data,
    });
    res.status(httpStatus.OK).json(response);
  }
);

const addCreditLog = catchAsync(
  async (req: Request, res: CustomResponse) => {
    const { password, rate, userId } = req.body;
    const data = await UserService.addCreditLog(req?.user, password, rate, userId);
    const response = prepareResponse({
      message: "balance added successfully.",
      data: null,
    });
    res.status(httpStatus.CREATED).json(response);
  }
);

const getCreditLog = catchAsync(
  async (req: any, res: CustomResponse) => {
    const{userId} = req.query
    const data = await UserService.getCreditLog(req?.user, userId);
    const response = prepareResponse({
      message: "credit log fetched successfully.",
      data,
    });
    res.status(httpStatus.OK).json(response);
  }
);

const updateStatus = catchAsync(
  async (req: Request, res: CustomResponse) => {
    const { password, status, userId } = req.body;
    const data = await UserService.updateStatus(req?.user, password, status, userId, "status");
    const response = prepareResponse({
      message: "Status update successfully.",
      data,
    });
    res.status(httpStatus.OK).json(response);
  }
);

const updateExposure = catchAsync(
  async (req: Request, res: CustomResponse) => {
    const { password, exposure, userId } = req.body;
    const data = await UserService.updateStatus(req?.user, password, exposure, userId, "exposure");
    const response = prepareResponse({
      message: "Exposure update successfully.",
      data:null,
    });
    res.status(httpStatus.OK).json(response);
  }
);

const myBalance = catchAsync(
  async (req: Request, res: CustomResponse) => {
    const data = await UserService.myBalance(req?.user);
    const response = prepareResponse({
      message: "Balance get successfully.",
      data,
    });
    res.status(httpStatus.OK).json(response);
  }
);

const exportCsv = catchAsync(
  async (req: Request, res: CustomResponse) => {
    const { username, status, userId } = req.body;
    const data = await UserService.exportCsv(username, status, userId);
    console.log("data", data);

    const response = prepareResponse({
      message: "CSV generate successfully.",
      data,
    });
    res.status(httpStatus.OK).json(response);
  }
);

export default { fetchUserProfile, fetchUserDownline, Register, myDownline, addCreditLog, getCreditLog, updateStatus, updateExposure, myBalance, exportCsv };
