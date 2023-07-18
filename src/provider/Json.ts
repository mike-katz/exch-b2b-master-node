import express, { Application } from "express";

export class JsonProvider {
  public static init(app: Application): void {
    app.use(express.json());
  }
}
export default "json";
