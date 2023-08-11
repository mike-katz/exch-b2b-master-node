import * as Joi from "joi";

const saveTransaction = {
  body: Joi.object().keys({
    data: Joi.array(),
  //  data: Joi.array().items(
  //   Joi.object({
  //     userId: Joi.string().required(),
  //     balance: Joi.number().positive().optional(),
  //     type: Joi.string().valid('deposit', 'withdraw',"").required(),
  //     remark: Joi.string().optional(),
  //     creditRef: Joi.number().optional(),
  //   })
  //   ).required(),    
    password: Joi.string().required(),
  }),
};

const getTransaction = {
  query: Joi.object().keys({
    userId: Joi.string().optional(),
    // search: Joi.string().optional(),
    // status: Joi.string().optional(),
    page: Joi.number().required(),
    limit: Joi.number().required(),
  })
};

export default { saveTransaction, getTransaction };
