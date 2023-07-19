import { Request } from "express";

import { CustomResponse } from "@/types";
import { UserProfile } from "@/types/user.interfaces";
import catchAsync from "@/utils/catchAsync";
import prepareResponse from "@/utils/prepareResponse";

const fetchUserProfile = catchAsync(
  async (req: Request, res: CustomResponse) => {
    const { firstName, lastName, email, mobileNo, countryCode, userRole } =
      req.user as UserProfile;
    const userData = {
      firstName,
      lastName,
      email,
      mobileNo,
      countryCode,
      userRole,
    };
    res.send(prepareResponse({ msg: "SUCCESS", data: { user: userData } }));
  }
);

export default { fetchUserProfile };
