import { Request, Response } from "express";

import { CustomResponse } from "@/types";
import catchAsync from "@/utils/catchAsync";
import prepareResponse from "@/utils/prepareResponse";
import * as UserService from "./user.service";
import httpStatus from "http-status";
import pick from "@/utils/pick";
import ApiError from "@/utils/ApiError";

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
    const headerOrigin = req.headers.origin;
    if (!headerOrigin) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "Origin header not found in the request",
      });
    }
    const { origin } = req.body;
    req.body.origin = origin ? origin : headerOrigin
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
      message: "credit Ref. updated successfully.",
      data: null,
    });
    res.status(httpStatus.CREATED).json(response);
  }
);

const getCreditLog = catchAsync(
  async (req: any, res: Response) => {
    const { userId } = req.query;
    const resp: any = await UserService.getCreditLog(req?.user, userId);
    res.status(httpStatus.OK).json({
      message: "credit log fetched successfully.",
      data: resp?.data,
      userId: userId ? userId : req?.user?._id,
      username: resp?.username
    });
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
      data: null,
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
    const { search, status, userId, type } = req.body;
    const data = await UserService.exportCsv(search, status, userId, type, req?.user);
    const response = prepareResponse({
      message: "CSV generate successfully.",
      data,
    });
    res.status(httpStatus.OK).json(response);
  }
);

const getParentUsername = catchAsync(
  async (req: any, res: CustomResponse) => {
    const { userId } = req.query;
    const data = await UserService.getParentUsername(userId);
    const response = prepareResponse({
      message: "username get successfully.",
      data,
    });
    res.status(httpStatus.OK).json(response);
  }
);

const updateProfile = catchAsync(
  async (req: Request, res: CustomResponse) => {
    const data = await UserService.updateProfile(req.body, req.user);
    const response = prepareResponse({
      message: "profile update successfully.",
      data,
    });
    res.status(httpStatus.OK).json(response);
  }
);

const profileLog = catchAsync(
  async (req: any, res: CustomResponse) => {
    const { userId } = req.query;
    const options = pick(req?.query, ["sortBy", "limit", "page"]);
    const data = await UserService.profileLog(userId, req.user, options);
    const response = {
      message: "Get profile log successfully.",
      ...data,
    };
    res.status(httpStatus.OK).json(response);
  }
);

const exposureList = catchAsync(
  async (req: any, res: CustomResponse) => {
    const { userId } = req.query;
    const data = await UserService.getExposureList(userId);
    const response = {
      message: "Get Exposure List successfully.",
      ...data,
    };
    res.status(httpStatus.OK).json(response);
  }
);

export default { fetchUserProfile, fetchUserDownline, Register, myDownline, addCreditLog, getCreditLog, updateStatus, updateExposure, myBalance, exportCsv, getParentUsername, updateProfile, profileLog, exposureList };
