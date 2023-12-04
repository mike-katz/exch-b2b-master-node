import * as Joi from "joi";

const bettingHistory = {
  query: Joi.object().keys({
    userId: Joi.optional(),
    status: Joi.optional(),
    from: Joi.optional(),
    to: Joi.optional(),
    marketType: Joi.optional(),
    sportName: Joi.optional(),
    sportId: Joi.optional(),
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
    search: Joi.optional(),
    limit: Joi.required(),
    page: Joi.required()
  }),
};

const matchBet = {
  query: Joi.object().keys({
    eventId: Joi.required(),
    page: Joi.required(),
    limit: Joi.required(),
    }),
};

const betPL = {
  query: Joi.object().keys({
    eventId: Joi.required(),
    status:Joi.optional()
  }),
};

const betLock = {
  body: Joi.object().keys({
    eventId: Joi.required(),
    status: Joi.required(),
    type: Joi.required()
  }),
};

const betLockLog = {
  query: Joi.object().keys({
    }),
};

const getLatestBet = {
  query: Joi.object().keys({
    eventId: Joi.required(),
  }),
};

const marketBet = {
  query: Joi.object().keys({
    marketId: Joi.required(),
    page: Joi.required(),
    limit: Joi.required(),
    }),
};

export default { bettingHistory, profitLoss, transaction, getSports, betList, matchBet, betPL, betLock, betLockLog, getLatestBet, marketBet};
