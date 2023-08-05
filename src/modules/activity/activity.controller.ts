
import { CustomResponse } from "@/types";
import catchAsync from "@/utils/catchAsync";

import * as ActivityService from "./activity.service";
import httpStatus from "http-status";
const fetchActivity = catchAsync(
  async (req: any, res: CustomResponse) => {
    const { userId } = req.query
    const data = await ActivityService.fetchActivity(req.user, userId);
    res.status(httpStatus.OK).json({
      message: "Activity success",
      data,
    });
  }
);

export default { fetchActivity };
