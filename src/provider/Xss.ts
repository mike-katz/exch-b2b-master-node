import express, { Application } from "express";
import xss from "xss-clean";

export class XssProvider {
  public static init(app: Application): void {
    app.use((xss as () => express.RequestHandler)());
  }
}
export default "xss";
