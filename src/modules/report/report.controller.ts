
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

export default { fetchSportTotalPL };
