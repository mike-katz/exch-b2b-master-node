
import { CustomResponse } from "@/types";
import catchAsync from "@/utils/catchAsync";

import * as ActivityService from "./extra.service";
import httpStatus from "http-status";

const saveNews = catchAsync(
  async (req: any, res: any) => {
    const { news, origin } = req.body
    await ActivityService.saveNews(req.user, origin, news);
    res.status(httpStatus.OK).json( {message: "News update success"});
  }
);

export default { saveNews};
