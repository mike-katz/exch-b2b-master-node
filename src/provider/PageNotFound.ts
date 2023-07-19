import { Application } from "express";
import httpStatus from "http-status";

import ApiError from "@/utils/ApiError";

export class PageNotFoundProvider {
  public static init(app: Application): void {
    app.use((_req, _res, next) => {
      next(
        new ApiError(httpStatus.NOT_FOUND, {
          msg: "NOT_FOUND",
          message: "Route not found",
        })
      );
    });
  }
}
export default "pagenotfound";
