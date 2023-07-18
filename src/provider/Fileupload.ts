import { Application } from "express";
import fileUpload from "express-fileupload";

export class FileUploadProvider {
  // Initialize your Sentry pool
  public static init(app: Application): void {
    app.use(fileUpload());
  }
}
export default "fileUpload";
