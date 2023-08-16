import * as Joi from "joi";

const bettingHistory = {
  body: Joi.object().keys({
    type: Joi.optional(),
    status: Joi.optional(),
    from: Joi.optional(),
    to: Joi.optional()
  }),
};


const profitLoss = {
  body: Joi.object().keys({
    type: Joi.optional(),
    from: Joi.optional(),
    to: Joi.optional()
  }),
};

const transaction = {
  body: Joi.object().keys({}),
};


const getSports = {
  body: Joi.object().keys({}),
};

export default { bettingHistory, profitLoss, transaction, getSports };
