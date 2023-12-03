import { Request } from "express";

import { CustomResponse } from "@/types";
import catchAsync from "@/utils/catchAsync";
import prepareResponse from "@/utils/prepareResponse";

import * as BettingService from "./beating.service";
import httpStatus from "http-status";
import pick from "@/utils/pick";

const bettingHistory = catchAsync(
  async (req: any, res: CustomResponse) => {
    const filter = pick(req?.query, ['marketType','userId', 'sportName', 'status', 'from', 'to']);
    const options = pick(req?.query, ["sortBy", "limit", "page"]);
    const data = await BettingService.bettingHistory(req.user, filter, options);
    const response = prepareResponse({
      message: "Betting success",
      data,
    });
    res.status(httpStatus.OK).json(response);
  }
);

const profitLoss = catchAsync(
  async (req: any, res: CustomResponse) => {
    const filter = pick(req?.query, ["userId", "sportName", "from", "to"]);
    const options = pick(req?.query, ["sortBy", "limit", "page"]);
    const data = BettingService.profitLoss(req.user, filter, options);
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

const betList = catchAsync(
  async (req: any, res: CustomResponse) => {
    const filter = pick(req?.query, ["marketType", "sportName", "search", "status", "from", "to"]);
    const options = pick(req?.query, ["sortBy", "limit", "page"]);
    const data = await BettingService.betList(req.user, filter, options);
    const response = prepareResponse({
      message: "Betting success",
      data,
    });
    res.status(httpStatus.OK).json(response);
  }
);

const matchBet = catchAsync(
  async (req: any, res: CustomResponse) => {
    const { eventId, status } = req.query
    const options = pick(req?.query, ["sortBy", "limit", "page"]);
    const data = await BettingService.matchBet(req.user, eventId, options);
    const response = prepareResponse({
      message: "fetch Bet success",
      data,
    });
    res.status(httpStatus.OK).json(response);
  }
);

const betPL = catchAsync(
  async (req: any, res: CustomResponse) => {
    const { eventId } = req.query
    const data = await BettingService.betPL(req.user, eventId);
    const response = prepareResponse({
      message: "fetch Bet PL success",
      data,
    });
    res.status(httpStatus.OK).json(response);
  }
);

const betLock = catchAsync(
  async (req: Request, res: CustomResponse) => {
    const { eventId, type, status } = req.body
    const data = await BettingService.betLock(req.user, eventId, type, status);
    const response = prepareResponse({
      message: "Bet status update success",
      data,
    });
    res.status(httpStatus.OK).json(response);
  }
);

const betLockLog = catchAsync(
  async (req: Request, res: CustomResponse) => {
    const data = await BettingService.betLockLog(req.user);
    const response = prepareResponse({
      message: "Bet log success",
      data,
    });
    res.status(httpStatus.OK).json(response);
  }
);
export default { bettingHistory, betList, profitLoss, transaction, getSports, matchBet, betPL, betLock, betLockLog };
