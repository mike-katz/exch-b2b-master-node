import * as Joi from "joi";

const userSportsProfitloss = {
  query: Joi.object().keys({
    timeZone: Joi.optional(),
    sportId: Joi.optional(),
    eventId: Joi.optional(),
    marketId: Joi.optional(), 
    category: Joi.optional(),
    eventName: Joi.optional(), 
    roundId: Joi.optional(),
    username: Joi.string(),
    from: Joi.string(),
    to: Joi.string(),
    page: Joi.optional(),
    limit: Joi.optional(),
  }),
};

export default { userSportsProfitloss };
