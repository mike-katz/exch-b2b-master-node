
import { CustomResponse } from "@/types";
import catchAsync from "@/utils/catchAsync";

import * as ActivityService from "./activity.service";
import httpStatus from "http-status";
import { Response } from "express";
const fetchActivity = catchAsync(
  async (req: any, res: Response) => {
    const { userId } = req.query
    const resp:any = await ActivityService.fetchActivity(req.user, userId);
    res.status(httpStatus.OK).json({
      message: "Activity success",
      data: resp?.data,
      userId: userId ? userId : req?.user?._id,
      username: resp?.username
    });
  }
);

export default { fetchActivity };
