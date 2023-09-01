import catchAsync from "@/utils/catchAsync";

import * as MarketService from "./market.service";
import httpStatus from "http-status";
import { Request, Response } from "express";

const fetchMarket = catchAsync(
  async (req: Request, res: Response) => {
    const resp:any = await MarketService.fetchMarket();
    res.status(httpStatus.OK).json({
      message: "Market success",
      data: resp      
    });
  }
);

export default { fetchMarket };
