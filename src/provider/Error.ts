import { Application } from "express";

import { errorConverter, errorHandler } from "@/middleware/error";

export class ErrorProvider {
  public static init(app: Application): void {
    app.use(errorConverter);
    app.use(errorHandler);
  }
}
export default "error";
