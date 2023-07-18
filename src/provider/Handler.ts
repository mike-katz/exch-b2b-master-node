import { Application } from "express";

import {
  errorHandler as logErrorHandler,
  successHandler,
} from "@/config/morgan";

export class HandlerProvider {
  public static init(app: Application): void {
    app.use(successHandler);
    app.use(logErrorHandler);
  }
}
export default "handler";
