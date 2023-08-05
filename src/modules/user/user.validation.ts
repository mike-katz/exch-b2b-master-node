import * as Joi from "joi";

const fetchUserProfile = {
  query: Joi.object().keys({
    userId: Joi.optional(),
  }),
};

const fetchUserDownline = {
  body: Joi.object().keys({
  }),
};

const Register = {
  body: Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required(),
    mobile: Joi.optional(),
    ip: Joi.optional(), 
    exposure:Joi.number().required(),
    commission: Joi.number().required(),
    roles:Joi.string().required(),
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
  query: Joi.object().keys({
    userId:Joi.string().optional(),

  }),
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
  body: Joi.object().keys({
    userId: Joi.string().optional(),
    status: Joi.string().optional(),
    search: Joi.string().optional(),
    type: Joi.string().required(),
  }),
};

export default { fetchUserProfile, fetchUserDownline, Register, myDownline, addCreditLog, getCreditLog, updateStatus, search, myBalance, exportCsv };
