import { Application } from "express";
import ExpressMongoSanitize from "express-mongo-sanitize";

export class SanitizeProvider {
  public static init(app: Application): void {
    app.use(ExpressMongoSanitize());
  }
}
export default "sanitize";
