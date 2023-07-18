import { IncomingHttpHeaders } from "node:http";

import httpStatus from "http-status";

import { userOtpVarification } from "@/config/otp";
import { CustomResponse } from "@/types";
import catchAsync from "@/utils/catchAsync";
import messages from "@/utils/messages";
import prepareResponse from "@/utils/prepareResponse";

import { ISendOtpBody, IVerifyOtpBody } from "./otp.interfaces";
import * as OTPService from "./otp.service";

const sendOtp = catchAsync(
  async (
    req: { body: ISendOtpBody; headers: IncomingHttpHeaders },
    res: CustomResponse
  ) => {
    await OTPService.requestValidation(req.body);
    const { countryCode, mobileNo, email, source } = req.body;
    const otpToken = req.headers["otp-token"] as string;
    const data =
      source === userOtpVarification.PHONE
        ? await OTPService.sendOtpByMobile(countryCode, mobileNo, otpToken)
        : await OTPService.sendOtpByEmail(email);
    const response = prepareResponse({
      code: messages.otp.OTP_SENT_SUCCESSFULLY,
      data,
    });
    res.status(httpStatus.OK).send(response);
  }
);

const verifyOtp = catchAsync(
  async (req: { body: IVerifyOtpBody }, res: CustomResponse): Promise<void> => {
    await OTPService.requestValidation(req.body);
    const { countryCode, mobileNo, email, otp, source } = req.body;
    const verifyData =
      source === userOtpVarification.PHONE
        ? await OTPService.verifyOtpByMobile(countryCode, mobileNo, otp)
        : await OTPService.verifyOtpByEmail(email, otp);
    const response = prepareResponse({
      code: messages.auth.VERIFY_SUCCESSFULLY,
      data: verifyData,
    });
    res.status(httpStatus.OK).send(response);
  }
);

export { sendOtp, verifyOtp };
