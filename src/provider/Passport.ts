import { Application } from "express";
import passport, { Strategy } from "passport";

import logger from "@/config/logger";
import {
  jwtStrategy,
} from "@/config/passport";

export class PassportProvider {
  public static init(app: Application): void {
    app.use(passport.initialize());
    logger.info(`passport loadded`);
    passport.use("jwt", jwtStrategy);    
  }
}

export default "passport";
