import catchAsync from "@/utils/catchAsync";

import * as PlService from "./pl.service";
import httpStatus from "http-status";
import { Response } from "express";
import pick from "@/utils/pick";

const userSportsProfitloss = catchAsync(
  async (req: any, res: Response) => {
    const filters = pick(req?.query, ['from', 'to', 'timeZone', 'userId']);
    const resp: any = await PlService.userSportsProfitloss(filters);
    res.status(httpStatus.OK).json({
      message: "Data get success",
      data: resp
    });
  }
);

const userEventsProfitloss = catchAsync(
  async (req: any, res: Response) => {
    const options = pick(req?.query, ['sortBy', 'limit', 'page']);
    const filters = pick(req?.query, ['from', 'to', 'timeZone', 'userId', 'sportId']);
    const resp: any = await PlService.userEventsProfitloss(filters, options);
    res.status(httpStatus.OK).json({
      message: "Data get success",
      data: resp
    });
  }
);

const userMarketsProfitloss = catchAsync(
  async (req: any, res: Response) => {
    const options = pick(req?.query, ['sortBy', 'limit', 'page']);
    const filters = pick(req?.query, ['from', 'to', 'timeZone', 'userId', 'eventId']);
    const resp: any = await PlService.userMarketsProfitloss(filters, options);
    res.status(httpStatus.OK).json({
      message: "Data get success",
      data: resp
    });
  }
);

const getUserBetList = catchAsync(
  async (req: any, res: Response) => {
    const options = pick(req?.query, ['sortBy', 'limit', 'page']);
    const filters = pick(req?.query, ['from', 'to', 'timeZone', 'userId', 'sportId', 'marketId']);
    const resp: any = await PlService.getUserBetList(filters, options);
    res.status(httpStatus.OK).json({
      message: "Data get success",
      data: resp
    });
  }
);

const aviatorSumOfPl = catchAsync(
  async (req: any, res: Response) => {
    const filters = pick(req?.query, ['from', 'to', 'timeZone', 'userId']);
    const resp: any = await PlService.aviatorSumOfPl(filters);
    res.status(httpStatus.OK).json({
      message: "Data get success",
      data: resp
    });
  }
);

const aviatorPl = catchAsync(
  async (req: any, res: Response) => {
    const options = pick(req?.query, ['sortBy', 'limit', 'page']);
    const filters = pick(req?.query, ['from', 'to', 'timeZone', 'userId']);
    const resp: any = await PlService.aviatorPl(filters, options);
    res.status(httpStatus.OK).json({
      message: "Data get success",
      data: resp
    });
  }
);

const getCategoryTotalPL = catchAsync(
  async (req: any, res: Response) => {
    const filters = pick(req?.query, ['from', 'to', 'timeZone', 'userId']);
    const resp: any = await PlService.getCategoryTotalPL(filters);
    res.status(httpStatus.OK).json({
      message: "Data get success",
      data: resp
    });
  }
);

const getCategoryList = catchAsync(
  async (req: any, res: Response) => {
    const options = pick(req?.query, ['sortBy', 'limit', 'page']);
    const filters = pick(req?.query, ['from', 'to', 'timeZone', 'userId']);
    const resp: any = await PlService.getCategoryList(filters, options);
    res.status(httpStatus.OK).json({
      message: "Data get success",
      data: resp
    });
  }
);

const getGameList = catchAsync(
  async (req: any, res: Response) => {
    const options = pick(req?.query, ['sortBy', 'limit', 'page']);
    const filters = pick(req?.query, ['from', 'to', 'timeZone', 'userId', 'category']);
    const resp: any = await PlService.getGameList(filters, options);
    res.status(httpStatus.OK).json({
      message: "Data get success",
      data: resp
    });
  }
);

const userSportsProfitlossAura = catchAsync(
  async (req: any, res: Response) => {
    const filters = pick(req?.query, ['from', 'to', 'timeZone', 'userId']);
    const resp: any = await PlService.userSportsProfitlossAura(filters);
    res.status(httpStatus.OK).json({
      message: "Data get success",
      data: resp
    });
  }
);

const userEventsProfitlossAura = catchAsync(
  async (req: any, res: Response) => {
    const options = pick(req?.query, ['sortBy', 'limit', 'page']);
    const filters = pick(req?.query, ['from', 'to', 'timeZone', 'userId']);
    const resp: any = await PlService.userEventsProfitlossAura(filters, options);
    res.status(httpStatus.OK).json({
      message: "Data get success",
      data: resp
    });
  }
);

const userMarketsProfitlossAura = catchAsync(
  async (req: any, res: Response) => {
    const options = pick(req?.query, ['sortBy', 'limit', 'page']);
    const filters = pick(req?.query, ['from', 'to', 'timeZone','userId', 'matchName']);
    const resp: any = await PlService.userMarketsProfitlossAura(filters, options);
    res.status(httpStatus.OK).json({
      message: "Data get success",
      data: resp
    });
  }
);

const getUserBetListAura = catchAsync(
  async (req: any, res: Response) => {
    const options = pick(req?.query, ['sortBy', 'limit', 'page']);
    const filters = pick(req?.query, ['from', 'to', 'timeZone','userId', 'roundId']);
    const resp: any = await PlService.getUserBetListAura(filters, options);
    res.status(httpStatus.OK).json({
      message: "Data get success",
      data: resp
    });
  }
);

export default { userSportsProfitloss, userEventsProfitloss, userMarketsProfitloss, getUserBetList, aviatorSumOfPl, aviatorPl, getCategoryTotalPL, getCategoryList, getGameList, userSportsProfitlossAura, userEventsProfitlossAura, userMarketsProfitlossAura, getUserBetListAura };
