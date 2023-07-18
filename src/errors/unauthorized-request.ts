import ApplicationError from "./application-error";

export default class UnauthorizedRequest extends ApplicationError {
  constructor(message?: string) {
    super(message || "Unauthorized", 401);
  }
}
