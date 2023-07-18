import { IncomingHttpHeaders } from "node:http";

import { Request } from "express";
import httpStatus from "http-status";
import mongoose from "mongoose";

import config from "@/config/config";
import { decryptData } from "@/config/encryption";
import { userOtpVarification } from "@/config/otp";
import { userEmailVarification } from "@/config/users";
import { requestValidation } from "@/modules/otp/otp.service";
import * as TokenService from "@/service/token.service";
import { CustomResponse, IRoutePath } from "@/types";
import { NewRegisteredUser, UserProfile } from "@/types/user.interfaces";
import ApiError from "@/utils/ApiError";
import checkRecaptcha from "@/utils/captcha";
import catchAsync from "@/utils/catchAsync";
import messages from "@/utils/messages";
import prepareResponse from "@/utils/prepareResponse";
import { clientFunction } from "@/utils/utils";

import { ILoginBody, IRegisterBody } from "./auth.interfaces";
import * as AuthService from "./auth.service";

const {
  loginTypes,
  email: { verificationBy },
} = config;

const getUserRole = (path: string): string =>
  path.includes("admin") ? "admin" : "user";

const login = catchAsync(
  async (
    req: {
      route: IRoutePath;
      headers: IncomingHttpHeaders;
      body: ILoginBody;
    },
    res: CustomResponse
  ) => {
    const { email, mobileNo, countryCode, password, captchaToken } = req.body;
    if (!AuthService.isValidLogin(email, mobileNo, countryCode)) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        code: messages.INVALID_REQUEST,
      });
    }
    const { path } = req.route;
    const role = getUserRole(path);

    const client = clientFunction(req.headers);
    const { user, tokens } = await AuthService.loginUser(
      mobileNo,
      countryCode,
      email,
      password,
      captchaToken,
      client,
      role
    );
    const response = prepareResponse({
      code: messages.auth.LOGIN_SUCCESS,
      data: { user, tokens },
    });
    res.status(httpStatus.OK).json(response);
  }
);

const register = catchAsync(
  async (
    req: { body: IRegisterBody; headers: IncomingHttpHeaders },
    res: CustomResponse
  ) => {
    const client = clientFunction(req.headers);
    const userRegistration = await AuthService.createUser({
      ...req.body,
      client,
    } as NewRegisteredUser);
    res.status(httpStatus.CREATED).json(
      prepareResponse({
        code: messages.auth.REGISTER_SUCCESS,
        data: userRegistration,
      })
    );
  }
);

const verifyEmail = catchAsync(
  async (req: { body: { token: string } }, res: CustomResponse) => {
    if (!loginTypes.email || verificationBy !== userEmailVarification.LINK) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        code: messages.INVALID_REQUEST,
      });
    }

    const { token } = req.body;
    const decryptedString = decryptData(token);
    const arr = decryptedString.split("||");
    if (arr.length > 0) {
      const emailToken = arr[0];
      const userId = arr[1];
      const code = await AuthService.verifyEmail(
        emailToken,
        new mongoose.Types.ObjectId(userId)
      );
      res.status(httpStatus.OK).json(
        prepareResponse({
          code,
        })
      );
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        code: messages.SOMETHING_WENT_WRONG,
      });
    }
  }
);

const sendVerificationEmail = catchAsync(
  async (
    req: {
      body: {
        type: string;
        email: string;
        captchaToken: string;
      };
      route: IRoutePath;
    },
    res: CustomResponse
  ) => {
    if (!loginTypes.email || verificationBy !== userEmailVarification.LINK) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        code: messages.INVALID_REQUEST,
      });
    }
    const { path } = req.route;
    const role = getUserRole(path);
    const { type, email, captchaToken } = req.body;
    const verificationMailType = [
      "verifyAccount",
      "forgotPassword",
      "re-send-forgotPassword",
    ];
    const result = verificationMailType.includes(type);
    if (!result)
      throw new ApiError(httpStatus.BAD_REQUEST, {
        code: messages.auth.AUTH_INVALID_CRED,
      });

    const response = await AuthService.sendVerificationEmail(
      type,
      email,
      captchaToken,
      role
    );
    res.status(httpStatus.OK).json(
      prepareResponse({
        code: response,
      })
    );
  }
);

const resetPassword = catchAsync(
  async (
    req: {
      body: {
        token: string;
        password: string;
        email: string;
        source: string;
        otp: number;
        captchaToken: string;
      };
    },
    res: CustomResponse
  ) => {
    const { token, password, email, source, otp, captchaToken } = req.body;
    await requestValidation({ source, email });
    const validateCaptcha = await checkRecaptcha(captchaToken);
    if (!validateCaptcha) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        code: messages.CAPTCHA_INVALID,
      });
    }
    if (source === userOtpVarification.EMAIL) {
      if (verificationBy === userEmailVarification.LINK) {
        if (!token) {
          throw new ApiError(httpStatus.BAD_REQUEST, {
            code: messages.INVALID_REQUEST,
          });
        }
        await AuthService.resetPasswordByLink(token, password);
      } else if (verificationBy === userEmailVarification.OTP) {
        if (!email || !otp) {
          throw new ApiError(httpStatus.BAD_REQUEST, {
            code: messages.INVALID_REQUEST,
          });
        }

        await AuthService.resetPasswordbyOtp({
          email,
          password,
          source,
        });
      }
    } else {
      await AuthService.resetPasswordbyOtp(req.body);
    }
    res.status(httpStatus.OK).json(
      prepareResponse({
        code: messages.auth.UPDATE_PASSWORD_SUCCESSFULLY,
      })
    );
  }
);

// 3rd party integration needed.
const getVerificationCode = catchAsync(
  async (req: Request, res: CustomResponse) => {
    res.status(httpStatus.OK).json(
      prepareResponse({
        code: messages.otp.OTP_SENT_SUCCESSFULLY,
      })
    );
  }
);

const logout = catchAsync(
  async (
    req: {
      headers: IncomingHttpHeaders;
      body: { refreshToken: string; deviceToken?: string };
    },
    res: CustomResponse
  ) => {
    const client = clientFunction(req.headers);
    await AuthService.logout(
      req.body.refreshToken,
      req.body.deviceToken,
      client
    );
    res.status(httpStatus.OK).json(
      prepareResponse({
        code: messages.auth.LOGOUT_SUCCESSFULLY,
      })
    );
  }
);

//   async (req: CustomRequest, res: CustomResponse) => {

const fileUploadDemo = catchAsync(async () => {
  // await AuthService.fileUploadDemo(req);
  //   if (!req.files)
  //     throw new ApiError(httpStatus.BAD_REQUEST, {
  //       code: "UPLOAD FILE OR CHECK KEY",
  //     });
  //   await AuthService.fileUploadDemo(
  //     req?.files,
  //     req.body.status === "proposal"
  //   );
  //   res.status(httpStatus.OK).json(
  //     prepareResponse({
  //       code: messages.FILE_UPLOAD_SUCCESSFULLY,
  //     })
  //   );
});

const handleRefreshToken = catchAsync(
  async (req: { body: { refreshToken: string } }, res: CustomResponse) => {
    const { refreshToken } = req.body;
    const newAuthToken = await TokenService.refreshTokenService(refreshToken);
    res
      .status(httpStatus.OK)
      .json(
        prepareResponse({ code: messages.SUCCESS, data: { newAuthToken } })
      );
  }
);

const forgotPassword = catchAsync(
  async (
    req: {
      body: {
        countryCode: string;
        mobileNo: string;
        email: string;
        source: string;
      };
    },
    res: CustomResponse
  ) => {
    if (verificationBy !== userEmailVarification.OTP) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        code: messages.INVALID_REQUEST,
      });
    }
    await requestValidation(req.body);
    const { countryCode, mobileNo, email, source } = req.body;

    await (source === userOtpVarification.PHONE
      ? AuthService.forgotPasswordByMobile(countryCode, mobileNo)
      : AuthService.forgotPasswordByEmail(email));

    const response = prepareResponse({
      code: messages.otp.OTP_SENT_SUCCESSFULLY,
    });
    res.status(httpStatus.OK).send(response);
  }
);

const updateDeviceToken = catchAsync(
  async (
    req: Request<
      NonNullable<unknown>,
      NonNullable<unknown>,
      { deviceToken: string }
    >,
    res: CustomResponse
  ) => {
    const { deviceToken } = req.body;
    await TokenService.addUpdateDeviceToken(
      deviceToken,
      req.user as UserProfile | false
    );
    res.status(httpStatus.OK).json(prepareResponse({ code: messages.SUCCESS }));
  }
);

const socialLogin = catchAsync(async (req: Request, res: CustomResponse) => {
  // TODO add client in passport or route file
  // const client = clientFunction(req.headers);
  if (!req.user) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      code: messages.auth.LOGIN_FAIL,
    });
  }
  res.status(httpStatus.OK).json(
    prepareResponse({
      code: messages.auth.LOGIN_SUCCESS,
    })
  );
});

export {
  fileUploadDemo,
  forgotPassword,
  getVerificationCode,
  handleRefreshToken,
  login,
  logout,
  register,
  resetPassword,
  sendVerificationEmail,
  socialLogin,
  updateDeviceToken,
  verifyEmail,
};
