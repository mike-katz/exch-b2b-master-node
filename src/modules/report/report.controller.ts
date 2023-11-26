
import { CustomResponse } from "@/types";
import catchAsync from "@/utils/catchAsync";

import * as ReportService from "./report.service";
import httpStatus from "http-status";
import { Response } from "express";
import pick from "@/utils/pick";

const fetchSportTotalPL = catchAsync(
  async (req: any, res: Response) => {
    const data:any = await ReportService.fetchSportTotalPL(req.user);
    res.status(httpStatus.OK).json({
      message: "Sports total pl success",
      data,      
    });
  }
);

const fetchAviatorTotalPL = catchAsync(
  async (req: any, res: Response) => {
    const data:any = await ReportService.fetchAviatorTotalPL(req.user);
    res.status(httpStatus.OK).json({
      message: "Aviator total pl success",
      data,      
    });
  }
);

const fetchCasinoTotalPL = catchAsync(
  async (req: any, res: Response) => {
    const data:any = await ReportService.fetchCasinoTotalPL(req.user);
    res.status(httpStatus.OK).json({
      message: "Casino total pl success",
      data,      
    });
  }
);

const fetchIntCasinoTotalPL = catchAsync(
  async (req: any, res: Response) => {
    const data:any = await ReportService.fetchIntCasinoTotalPL(req.user);
    res.status(httpStatus.OK).json({
      message: "Int casino total pl success",
      data,      
    });
  }
);

const fetchSportEventList = catchAsync(
  async (req: any, res: Response) => {
    const options = pick(req?.query, ['sortBy', 'limit', 'page']);
    const filter = pick(req?.query, ['exEventId','exMarketId', 'sportName']);

    const data:any = await ReportService.fetchSportEventList(req.user, filter, options);
    res.status(httpStatus.OK).json({
      message: "Sport Event List success",
      data,      
    });
  }
);

const fetchAviatorList = catchAsync(
  async (req: any, res: Response) => {
    const options = pick(req?.query, ['sortBy', 'limit', 'page']);
    const data:any = await ReportService.fetchAviatorList(req.user, options);
    res.status(httpStatus.OK).json({
      message: "Aviator List success",
      data,      
    });
  }
);

export default { fetchSportTotalPL, fetchAviatorTotalPL, fetchCasinoTotalPL, fetchIntCasinoTotalPL, fetchSportEventList, fetchAviatorList };
