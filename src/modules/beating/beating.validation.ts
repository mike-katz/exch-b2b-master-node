import * as Joi from "joi";

const bettingHistory = {
  query: Joi.object().keys({
    userId: Joi.optional(),
    status: Joi.optional(),
    from: Joi.optional(),
    to: Joi.optional(),
    marketType: Joi.optional(),
    sportName: Joi.optional(),
    limit: Joi.required(),
    page: Joi.required()
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

const betList = {
  query: Joi.object().keys({
    status: Joi.optional(),
    from: Joi.optional(),
    to: Joi.optional(),
    marketType: Joi.optional(),
    sportName: Joi.optional(),
    limit: Joi.required(),
    page: Joi.required()
  }),
};
export default { bettingHistory, profitLoss, transaction, getSports, betList };
