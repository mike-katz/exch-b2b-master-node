import * as Joi from "joi";

const fetchUserProfile = {
  body: Joi.object().keys({}),
};

const fetchUserDownline = {
  body: Joi.object().keys({
    userId: Joi.optional(),
  }),
};

const Register = {
  body: Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required(),
    mobile: Joi.optional(),
    ip: Joi.optional(), 
    exposure:Joi.number().required(),
    commission:Joi.number().required()
  }),
};

export default { fetchUserProfile,fetchUserDownline,Register };
