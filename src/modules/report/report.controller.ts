
import { CustomResponse } from "@/types";
import catchAsync from "@/utils/catchAsync";

import * as ReportService from "./report.service";
import httpStatus from "http-status";
import { Response } from "express";

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

export default { fetchSportTotalPL, fetchAviatorTotalPL, fetchCasinoTotalPL, fetchIntCasinoTotalPL };
