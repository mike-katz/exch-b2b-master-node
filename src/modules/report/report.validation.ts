import * as Joi from "joi";

const fetchSportTotalPL = {
  query: Joi.object().keys({
    timeZone: Joi.string().optional(),
    from: Joi.string().optional(),
    to: Joi.string().optional(),
    sortBy: Joi.string().optional(),
    order: Joi.string().optional(),
  }),
};

const fetchSportEventList = {
  query: Joi.object().keys({
    sportName: Joi.string().optional(),
    exEventId: Joi.string().optional(),
    exMarketId: Joi.string().optional(),
    from: Joi.string().optional(),
    to: Joi.string().optional(),
    timeZone: Joi.string().optional(),
    page: Joi.number().required(),
    limit: Joi.number().required(),
    sortBy: Joi.string().optional(),
    order: Joi.string().optional(),
  }),
};

const fetchAviatorList = {
  query: Joi.object().keys({
    from: Joi.string().optional(),
    to: Joi.string().optional(),
    timeZone: Joi.string().optional(),
    user: Joi.string().optional(),
    page: Joi.number().required(),
    limit: Joi.number().required(),
    sortBy: Joi.string().optional(),
    order: Joi.string().optional(),
  }),
};

const fetchIntCasinoList = {
  query: Joi.object().keys({
    from: Joi.string().optional(),
    to: Joi.string().optional(),
    timeZone: Joi.string().optional(),
    developerCode: Joi.string().optional(),
    gameName: Joi.string().optional(),
    page: Joi.number().required(),
    limit: Joi.number().required(),
    sortBy: Joi.string().optional(),
    order: Joi.string().optional(),
  }),
};

const fetchuserPLList = {
  query: Joi.object().keys({
    from: Joi.string().optional(),
    to: Joi.string().optional(),
    timeZone: Joi.string().optional(),
    search: Joi.string().optional(),
    userId: Joi.string().optional(),
    page: Joi.number().required(),
    limit: Joi.number().required(),
  }),
};
const userEventsProfitlossAura = {
  query: Joi.object().keys({
    from: Joi.string().optional(),
    to: Joi.string().optional(),
    timeZone: Joi.string().optional(),
    page: Joi.number().optional(),
    limit: Joi.number().optional(),
    sortBy: Joi.string().optional(),
    order: Joi.string().optional(),
  }),
};

const userMarketsProfitlossAura = {
  query: Joi.object().keys({
    from: Joi.string().optional(),
    to: Joi.string().optional(),
    timeZone: Joi.string().optional(),
    eventName: Joi.string().optional(),
    page: Joi.number().optional(),
    limit: Joi.number().optional(),
    matchName: Joi.required(),
  }),
};

export default { fetchSportTotalPL, fetchSportEventList, fetchAviatorList, fetchIntCasinoList, fetchuserPLList, userEventsProfitlossAura, userMarketsProfitlossAura };
