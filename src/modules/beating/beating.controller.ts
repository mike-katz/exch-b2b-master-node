import { Request } from "express";

import { CustomResponse } from "@/types";
import catchAsync from "@/utils/catchAsync";
import prepareResponse from "@/utils/prepareResponse";

import * as BettingService from "./beating.service";
import httpStatus from "http-status";

const bettingHistory = catchAsync(
  async (req: Request, res: CustomResponse) => {
    const { type, from, to, status } = req.body;

    const data = BettingService.bettingHistory(req.user, type, from, to, status);
    const response = prepareResponse({
      message: "Betting success",
      data,
    });
    res.status(httpStatus.OK).json(response);
  }
);

const profitLoss = catchAsync(
  async (req: Request, res: CustomResponse) => {
    const { type, from, to } = req.body;
    const data = BettingService.profitLoss(req.user, type, from, to);
    const response = prepareResponse({
      message: "Profit loss data success",
      data,
    });
    res.status(httpStatus.OK).json(response);
  }
);

const transaction = catchAsync(
  async (req: Request, res: CustomResponse) => {
    const data = BettingService.transaction(req.user);
    const response = prepareResponse({
      message: "Transaction history success",
      data,
    });
    res.status(httpStatus.OK).json(response);
  }
);

export default { bettingHistory, profitLoss, transaction };
