import { Request } from "express";

import { CustomResponse } from "@/types";
import { UserProfile } from "@/types/user.interfaces";
import catchAsync from "@/utils/catchAsync";
import prepareResponse from "@/utils/prepareResponse";
import * as UserService from "./user.service";
import httpStatus from "http-status";

const fetchUserProfile = catchAsync(
  async (req: Request, res: CustomResponse) => {
    const { firstName, lastName, mobile} =
      req.user as UserProfile;
    const userData = {
      firstName,
      lastName,
      mobile
    };
    res.send(prepareResponse({ message: "SUCCESS", data: { user: userData } }));
  }
);

const fetchUserDownline = catchAsync(
  async (req: Request, res: CustomResponse) => {
    const{id}=req.body
    const data = UserService.findDownline(req.user,id);    
    const response = prepareResponse({
      message: "User fetched success",
      data,
    });
    res.status(httpStatus.OK).json(response);
  }
);

const Register = catchAsync(
  async (req: Request, res: CustomResponse) => {
    UserService.Register(req.body);    
    const response = prepareResponse({
      message: "User created successful",
      data:null,
    });
    res.status(httpStatus.CREATED).json(response);
  }
);

export default { fetchUserProfile ,fetchUserDownline, Register};
