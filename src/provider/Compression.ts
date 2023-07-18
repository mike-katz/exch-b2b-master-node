import compression from "compression";
import { Application } from "express";

export class CompressionProvider {
  public static init(app: Application): void {
    app.use(compression());
  }
}
export default "compression";
