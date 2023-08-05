import { Request } from "express";

import { CustomResponse } from "@/types";
import catchAsync from "@/utils/catchAsync";
import prepareResponse from "@/utils/prepareResponse";

import * as ActivityService from "./activity.service";
import httpStatus from "http-status";
const fetchActivity = catchAsync(
  async (req: Request, res: CustomResponse) => {    
      const { userId } = req.body
      const data = ActivityService.fetchActivity(req.user, userId);
      const response = prepareResponse({
        message: "Activity success",
        data,
      });
      res.status(httpStatus.OK).json(response);    
  }
);

export default { fetchActivity };
