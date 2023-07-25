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
    commision:Joi.number().required()
  }),
};

const myDownline = {
  body: Joi.object().keys({}),
};


const addCreditLog = {
  body: Joi.object().keys({
    password: Joi.string().required(),
    rate:Joi.number().required(),
  }),
};

const getCreditLog = {
  body: Joi.object().keys({}),
};

export default { fetchUserProfile, fetchUserDownline, Register, myDownline,addCreditLog, getCreditLog };
