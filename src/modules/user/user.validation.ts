import * as Joi from "joi";

const fetchUserProfile = {
  query: Joi.object().keys({
    userId: Joi.optional(),
  }),
};

const fetchUserDownline = {
  query: Joi.object().keys({
    userId: Joi.string().optional(),
    search: Joi.string().optional(),
    status: Joi.string().optional(),
    page: Joi.number().required(),
    limit: Joi.number().required(),
    sortBy: Joi.string().optional(),
    order: Joi.string().optional(),
  }),
};

const Register = {
  body: Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required(),
    mobile: Joi.optional(),
    ip: Joi.optional(),
    exposure: Joi.optional(),
    commission: Joi.number().required(),
    roles: Joi.string().required(),
    origin: Joi.optional(),
    isSportBook: Joi.optional(),
    isIntCasino: Joi.optional(),
    isCasino: Joi.optional(),
    isAviator: Joi.optional(),    
  }),
};

const myDownline = {
  query: Joi.object().keys({
    userId: Joi.string().optional(),
    search: Joi.string().optional(),
    status: Joi.string().optional(),
    page: Joi.number().required(),
    limit: Joi.number().required(),
    sortBy: Joi.string().optional(),
    order: Joi.string().optional(),
  }),
};


const addCreditLog = {
  body: Joi.object().keys({
    password: Joi.string().required(),
    rate: Joi.number().required(),
    userId: Joi.string().required(),
  }),
};

const getCreditLog = {
  query: Joi.object().keys({
    userId: Joi.string().optional(),

  }),
};

const updateStatus = {
  body: Joi.object().keys({
    password: Joi.string().required(),
    status: Joi.string(),
    exposure: Joi.number(),
    userId: Joi.string().required(),
  }),
};

const search = {
  body: Joi.object().keys({
    username: Joi.string().optional(),
    status: Joi.string().optional(),
  }),
};

const myBalance = {
  body: Joi.object().keys({}),
};

const getParentUsername = {
  query: Joi.object().keys({
    userId: Joi.string().optional(),
  }),
};

const exportCsv = {
  body: Joi.object().keys({
    userId: Joi.string().optional(),
    status: Joi.string().optional(),
    search: Joi.string().optional(),
    type: Joi.string().required(),
  }),
};

const updateProfile = {
  body: Joi.object().keys({
    userId: Joi.string().required(),
    password: Joi.string().optional(),
    myPassword: Joi.string().required(),
    commission: Joi.number().optional(),
    mobile: Joi.string().optional(),
    isSportBook: Joi.optional(),
    isIntCasino: Joi.optional(),
    isCasino: Joi.optional(),
    isAviator: Joi.optional(),
  }),
};

const profileLog = {
  query: Joi.object().keys({
    userId: Joi.string().optional(),
    page: Joi.number().required(),
    limit: Joi.number().required(),
  }),
};

const exposureList = {
  query: Joi.object().keys({
    userId: Joi.string().optional(),
  }),
};

const demoCalculation = {
  query: Joi.object().keys({
    userId: Joi.string().required(),
    type: Joi.string().required(),
    checkExId: Joi.string().required(),
  }),
};

export default { fetchUserProfile, fetchUserDownline, Register, myDownline, addCreditLog, getCreditLog, updateStatus, search, myBalance, exportCsv, getParentUsername, updateProfile, profileLog, exposureList,demoCalculation };
