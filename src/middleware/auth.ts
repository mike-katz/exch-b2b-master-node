import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import mongoose from "mongoose";

import * as TokenService from "@/service/token.service";
import * as UserService from "@/service/user.service";

const sendUnauthorizedError = (res: Response): void => {
  res.status(httpStatus.UNAUTHORIZED).send({ message: "unauthorized access" });
}  

const auth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log("req.headers",req.headers.access_token);
  
  let accessToken: string | undefined = req.headers.access_token as string;
  if (!accessToken) {
    return sendUnauthorizedError(res);
  }

  const payload = TokenService.getPayloadFromToken(accessToken);

  if (payload && payload.exp && payload.iat) {
   
    const user = await UserService.getUserById(
      new mongoose.Types.ObjectId(payload.sub)
    );
    if (user) {
      req.user = user.toJSON();
    }
    return next();
  }

  return sendUnauthorizedError(res);
};

export default auth;