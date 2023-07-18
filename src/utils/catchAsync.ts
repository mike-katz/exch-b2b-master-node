import { NextFunction, Request } from "express";

import { AsyncRequestHandler, CustomResponse } from "@/types";

const nextControl = (func: NextFunction, error: Error): void => func(error);

const catchAsync =
  (fn: AsyncRequestHandler) =>
  (req: Request, res: CustomResponse, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error: Error) =>
      nextControl(next, error)
    );
  };

export default catchAsync;
