import cors from "cors";
import { Application } from "express";

export class CorsProvider {
  public static init(app: Application): void {
    app.use(cors());
    // app.options("*", cors());
  }
}
export default "cors";
