import { Request } from "express";

import { CustomResponse } from "@/types";
import catchAsync from "@/utils/catchAsync";
import prepareResponse from "@/utils/prepareResponse";

import * as BettingService from "./beating.service";
import httpStatus from "http-status";
import pick from "@/utils/pick";

const bettingHistory = catchAsync(
  async (req: any, res: CustomResponse) => {
    // const { type, from, to, status, userId, sportName } = req.body;

    const filter = pick(req?.query, ["userId","marketType","sportName", "status","type", "from", "to"]);
    const options = pick(req?.query, ["sortBy", "limit", "page"]);

    // const data = await BettingService.bettingHistory(req.user, type, from, to, status, userId, sportName);
    const data = await BettingService.bettingHistory(req.user,filter,options );
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

const getSports = catchAsync(
  async (req: Request, res: CustomResponse) => {
    const data = await BettingService.getSports();
    const response = prepareResponse({
      message: "Sports get success",
      data,
    });
    res.status(httpStatus.OK).json(response);
  }
);
export default { bettingHistory, profitLoss, transaction, getSports };
