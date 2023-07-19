import { NextFunction, Request } from "express";
import httpStatus from "http-status";
import mongoose from "mongoose";

import config from "@/config/config";
import loggers from "@/config/logger";
import { CustomResponse, ErrorData } from "@/types";
import ApiError from "@/utils/ApiError";
import messages from "@/utils/messages";

const errorConverter = (
  err: ApiError | mongoose.Error,
  req: Request,
  res: CustomResponse,
  next: NextFunction
): void => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode =
      error instanceof mongoose.Error
        ? httpStatus.BAD_REQUEST
        : httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(
      statusCode,
      { msg: message, message },
      false,
      err.stack
    );
  }

  next(error);
};

const errorHandler = (
  err: ApiError,
  req: Request,
  res: CustomResponse,
  next: NextFunction
): void => {
  let { statusCode, message } = err;
  const { isOperational, stack } = err;
  const { errorData }: { errorData: ErrorData } = err;

  if (config.env === "production" && !isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }

  res.locals.errorMessage = errorData?.message;
  const ENV_DEVELOPMENT_LOCAL = "development.local;";
  let response: {
    msg: string;
    message: string;
    error: boolean;
    data: unknown;
    stack?: string;
  } = {
    msg: errorData.msg || "",
    message: errorData?.message || "",
    error: true,
    data: errorData.data || null,
    ...((config.env === "development" ||
      config.env === ENV_DEVELOPMENT_LOCAL) && { stack }),
  };

  if (statusCode === 500) {
    response = {
      msg: errorData.msg || messages.SOMETHING_WENT_WRONG,
      message: errorData?.message || message,
      error: true,
      data: errorData?.data || null,
      ...((config.env === "development" ||
        config.env === ENV_DEVELOPMENT_LOCAL) && {
        stack,
      }),
    };
  }

  if (config.env === "development" || config.env === ENV_DEVELOPMENT_LOCAL) {
    loggers.error(err);
  }

  res.status(statusCode).json(response);
  next();
};

export { errorConverter, errorHandler };
