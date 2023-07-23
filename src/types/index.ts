import { NextFunction, Request, Response, Router } from "express";
import { FileArray } from "express-fileupload";

import { UserProfile } from "./user.interfaces";

export interface IRoute {
  path: string;
  route: Router;
}

export interface CustomRequest extends Request {
  user?: UserProfile;
  files?: FileArray;
}

export interface IResponseFormat {
  message: string | undefined;
  data: unknown | null;
  error: boolean;
}

export type ErrorData = { msg: string } & Partial<
  Pick<IResponseFormat, "message" | "data" | "error">
>;

type Send<T = Response> = (body: IResponseFormat) => T;

export interface CustomResponse extends Response {
  json: Send<this>;
  send: Send<this>;
}

export interface IRoutePath {
  path: string;
  methods: { [method: string]: boolean };
}

export type AsyncRequestHandler = (
  req: Request,
  res: CustomResponse,
  next: NextFunction
) => Promise<void>;
