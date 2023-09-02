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

const getMarketDetail = catchAsync(
  async (req: any, res: Response) => {
    const{eventId}= req.query
    const resp:any = await MarketService.getMarketDetail(eventId);
    res.status(httpStatus.OK).json({
      message: "Market success",
      data: resp      
    });
  }
);

const getStream = catchAsync(
  async (req: any, res: Response) => {
    const{eventId}= req.query
    const resp:any = await MarketService.getStream(eventId);
    res.status(httpStatus.OK).json({
      message: "Market success",
      data: resp      
    });
  }
);
export default { fetchMarket,getMarketDetail, getStream };
