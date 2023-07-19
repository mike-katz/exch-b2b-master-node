import { NextFunction, Request } from "express";
import httpStatus from "http-status";
import Joi, { ValidationError } from "joi";

import { CustomResponse } from "@/types";
import ApiError from "@/utils/ApiError";
import pick from "@/utils/pick";

const validate = (
  req: Request,
  res: CustomResponse,
  next: NextFunction,
  validationSchema: object
): void => {
  // const validSchema = pick(req, ["params", "query", "body"]);
  const object = pick(req, Object.keys(validationSchema));
  const validation = Joi.compile(validationSchema)
    .prefs({ errors: { label: "key" }, abortEarly: false })
    .validate(object);

  if (validation.error) {
    const errorMessage = (validation.error as ValidationError).details
      .map(details => details.message)
      .join(", ");
    return next(
      new ApiError(httpStatus.BAD_REQUEST, {
        msg: errorMessage,
        message: errorMessage,
      })
    );
  }

  Object.assign(req, validation.value);
  return next();
};

export default validate;
