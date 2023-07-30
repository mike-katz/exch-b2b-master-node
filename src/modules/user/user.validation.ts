import * as Joi from "joi";

const fetchUserProfile = {
  body: Joi.object().keys({
    userId: Joi.optional(),
  }),
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
    userId:Joi.string().required(),
  }),
};

const getCreditLog = {
  body: Joi.object().keys({}),
};

const updateStatus = {
  body: Joi.object().keys({
    password: Joi.string().required(),
    status: Joi.string(),
    exposure: Joi.number(),
    userId:Joi.string().required(),
  }),
};

const search = {
  body: Joi.object().keys({
    username: Joi.string().optional(),
    status:Joi.string().optional(),    
  }),
};

const myBalance = {
  body: Joi.object().keys({}),
};

const exportCsv = {
  body: Joi.object().keys({}),
};

export default { fetchUserProfile, fetchUserDownline, Register, myDownline, addCreditLog, getCreditLog, updateStatus, search, myBalance, exportCsv };
