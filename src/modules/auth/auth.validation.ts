// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable unicorn/no-thenable */
import Joi from "joi";

import { userOtpVarification } from "@/config/otp";
import passwordCheck from "@/utils/custom.validation";
import messages from "@/utils/messages";
import authValidation from "@/utils/validations/auth";

const login = {
  body: Joi.object().keys({    
    password: Joi.string().required(),
    username: Joi.string().required(),
    ip: Joi.string(),
  }),
};

const changePwd = {
  body: Joi.object().keys({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().required(),
  }),
};

export {
  login,
  changePwd,
};
