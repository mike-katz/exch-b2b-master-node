import { Application } from "express";
import mongoose from "mongoose";

import config from "@/config/config";
import logger from "@/config/logger";

export class DatabaseProvider {
  public static init(url: string, app: Application): void {
    // eslint-disable-next-line scanjs-rules/call_connect
    mongoose
      .connect(url)
      .then(() => {
        app.listen(config.port, () => {
          logger.info(`Listening to port ${config.port}`);
        });
        app.set("port", config.port || 3000);
        return logger.info("Connected to mongodb");
      })
      .catch((error: Error) => {
        logger.error(`Failed to connect to the Mongo server`);
        throw error;
      });
  }
}

export default "init";
