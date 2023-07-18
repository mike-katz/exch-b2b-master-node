// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable unicorn/no-thenable */
import Joi from "joi";

import { userOtpVarification } from "@/config/otp";
import messages from "@/utils/messages";

const sendOtp = {
  body: Joi.object().keys({
    source: Joi.string()
      .trim()
      .messages({ "string.empty": `${messages.INVALID_REQUEST}` })
      .valid(userOtpVarification.EMAIL, userOtpVarification.PHONE)
      .required(),
    countryCode: Joi.alternatives().conditional("source", {
      is: userOtpVarification.PHONE,
      then: Joi.string()
        .trim()
        .required()
        .messages({ "string.empty": `${messages.INVALID_REQUEST}` }),
      otherwise: Joi.forbidden(),
    }),
    mobileNo: Joi.alternatives().conditional("source", {
      is: userOtpVarification.PHONE,
      then: Joi.string()
        .trim()
        .required()
        .messages({ "string.empty": `${messages.INVALID_REQUEST}` }),
      otherwise: Joi.forbidden(),
    }),
    email: Joi.alternatives().conditional("source", {
      is: userOtpVarification.EMAIL,
      then: Joi.string()
        .trim()
        .messages({ "string.empty": `${messages.INVALID_REQUEST}` })
        .email()
        .min(3)
        .max(62)
        .required(),
      otherwise: Joi.forbidden(),
    }),
  }),
};

const verifyOtp = {
  body: Joi.object().keys({
    source: Joi.string()
      .trim()
      .messages({ "string.empty": `${messages.INVALID_REQUEST}` })
      .valid(userOtpVarification.EMAIL, userOtpVarification.PHONE)
      .required(),
    countryCode: Joi.alternatives().conditional("source", {
      is: userOtpVarification.PHONE,
      then: Joi.string()
        .trim()
        .required()
        .messages({ "string.empty": `${messages.INVALID_REQUEST}` }),
      otherwise: Joi.forbidden(),
    }),
    mobileNo: Joi.alternatives().conditional("source", {
      is: userOtpVarification.PHONE,
      then: Joi.string()
        .trim()
        .required()
        .messages({ "string.empty": `${messages.INVALID_REQUEST}` }),
      otherwise: Joi.forbidden(),
    }),
    email: Joi.alternatives().conditional("source", {
      is: userOtpVarification.EMAIL,
      then: Joi.string()
        .trim()
        .messages({ "string.empty": `${messages.INVALID_REQUEST}` })
        .email()
        .min(3)
        .max(62)
        .required(),
      otherwise: Joi.forbidden(),
    }),
    otp: Joi.number().required(),
  }),
};

export { sendOtp, verifyOtp };
