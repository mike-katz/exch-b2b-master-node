// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable unicorn/no-thenable */
import Joi from "joi";

import { userOtpVarification } from "@/config/otp";
import passwordCheck from "@/utils/custom.validation";
import messages from "@/utils/messages";
import authValidation from "@/utils/validations/auth";

const register = {
  body: Joi.object().keys({
    email: Joi.string()
      .email()
      .min(3)
      .max(62)
      .messages({
        "string.max": `${authValidation.EMAIL_MAX_62_NOT_ALLOW}`,
      })
      .optional(),
    password: Joi.string().required().custom(passwordCheck),
    firstName: Joi.string()
      .pattern(/^[A-Za-z]+$/)
      .messages({
        "string.pattern.base": `${authValidation.FIRSTNAME_NUMBER_NOT_ALLOW}`,
      })
      .required(),
    lastName: Joi.string()
      .pattern(/^[A-Za-z]+$/)
      .messages({
        "string.pattern.base": `${authValidation.LASTNAME_NUMBER_NOT_ALLOW}`,
      })
      .required(),
    mobile: Joi.string()
      .trim()
      .messages({ "string.empty": `${messages.INVALID_REQUEST}` })
      .optional(),
    countryCode: Joi.alternatives().conditional("mobile", {
      is: Joi.exist().not(null),
      then: Joi.string()
        .trim()
        .required()
        .messages({ "string.empty": `${messages.INVALID_REQUEST}` }),
      otherwise: Joi.forbidden(),
    }),
    captchaToken: Joi.string().required(),
    authType: Joi.string().required(),
  }),
};

const login = {
  body: Joi.object().keys({    
    password: Joi.string().required(),
    username: Joi.string().required(),
  }),
};

const verifyEmail = {
  body: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

const sendVerificationEmail = {
  body: Joi.object().keys({
    email: Joi.string()
      .email()
      .max(62)
      .messages({
        "string.max": `${authValidation.EMAIL_MAX_62_NOT_ALLOW}`,
      })
      .required(),
    type: Joi.string().required(),
    captchaToken: Joi.optional(),
  }),
};

const forgotPassword = {
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
    mobile: Joi.alternatives().conditional("source", {
      is: userOtpVarification.PHONE,
      then: Joi.string()
        .trim()
        .required()
        .messages({ "string.empty": `${messages.INVALID_REQUEST}` }),
      otherwise: Joi.forbidden(),
    }),
  }),
};

const resetPassword = {
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
    mobile: Joi.alternatives().conditional("source", {
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
        .optional(),
      otherwise: Joi.forbidden(),
    }),
    token: Joi.alternatives().conditional("source", {
      is: userOtpVarification.EMAIL,
      then: Joi.string().optional(),
      otherwise: Joi.forbidden(),
    }),
    otp: Joi.number().optional(),
    password: Joi.string().required().custom(passwordCheck),
    captchaToken: Joi.string().required(),
  }),
};

const getVerificationCode = {
  body: Joi.object().keys({
    mobile: Joi.string().required(),
  }),
};

const logout = {
  body: Joi.object().keys({
    source: Joi.string().required(),
    refreshToken: Joi.alternatives().conditional("source", {
      is: "local",
      then: Joi.string().required(),
      otherwise: Joi.forbidden(),
    }),
    deviceToken: Joi.alternatives().conditional("source", {
      is: "local",
      then: Joi.string().optional(),
      otherwise: Joi.string().required(),
    }),
  }),
};

const refreshToken = {
  headers: Joi.object().keys({
    // client: Joi.object().required(),
  }),
  body: Joi.object().keys({
    refreshToken: Joi.string()
      .required()
      .messages({
        "string.empty": `${messages.INVALID_REQUEST}`,
      }),
  }),
};

const updateDeviceToken = {
  body: Joi.object().keys({
    deviceToken: Joi.string().required(),
  }),
};

export {
  forgotPassword,
  getVerificationCode,
  login,
  logout,
  refreshToken,
  register,
  resetPassword,
  sendVerificationEmail,
  updateDeviceToken,
  verifyEmail,
};
