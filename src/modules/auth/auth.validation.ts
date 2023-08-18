import Joi from "joi";
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
