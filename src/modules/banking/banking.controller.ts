
import { CustomResponse } from "@/types";
import catchAsync from "@/utils/catchAsync";

import * as ActivityService from "./banking.service";
import httpStatus from "http-status";
import pick from "@/utils/pick";
import { Response } from "express";
const saveTransaction = catchAsync(
  async (req: any, res: CustomResponse) => {
    const { password, data } = req.body
    const response = await ActivityService.saveTransaction(req.user, password, data);
    res.status(httpStatus.OK).json({ message: response,data:null });
  }
);

const getTransaction = catchAsync(
  async (req: any, res: Response) => {
    const { userId } = req.query;
    const options = pick(req?.query, ["sortBy", "limit", "page"]);
    const resp:any = await ActivityService.getTransaction(req.user, userId, options);
    res.status(httpStatus.OK).json({
      message: "get Transaction log success",
       data: resp?.data,
      userId: userId ? userId : req?.user?._id,
      username: resp?.username
    });
  }
);

export default { saveTransaction, getTransaction};
