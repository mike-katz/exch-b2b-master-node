import { ErrorData } from "@/types";

class ApiError extends Error {
  statusCode: number;

  isOperational: boolean;

  errorData: ErrorData;

  constructor(
    statusCode: number,
    errorData: ErrorData,
    isOperational = true,
    stack = ""
  ) {
    super(errorData.code);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errorData = errorData;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
