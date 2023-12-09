import * as Joi from "joi";

const fetchSportTotalPL = {
  query: Joi.object().keys({
    timeZone: Joi.string().optional(),
    from: Joi.string().optional(),
    to: Joi.string().optional(),
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
  }),
};

const fetchAviatorList = {
  query: Joi.object().keys({
    from: Joi.string().optional(),
    to: Joi.string().optional(),
    timeZone: Joi.string().optional(),
    page: Joi.number().required(),
    limit: Joi.number().required(),
  }),
};

const fetchIntCasinoList = {
  query: Joi.object().keys({
    from: Joi.string().optional(),
    to: Joi.string().optional(),
    timeZone: Joi.string().optional(),
    developerCode: Joi.string().optional(),
    page: Joi.number().required(),
    limit: Joi.number().required(),
  }),
};

const fetchuserPLList = {
  query: Joi.object().keys({
    from: Joi.string().optional(),
    to: Joi.string().optional(),
    timeZone: Joi.string().optional(),
    userName: Joi.string().optional(),
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
  }),
};

const userMarketsProfitlossAura = {
  query: Joi.object().keys({
    from: Joi.string().optional(),
    to: Joi.string().optional(),
    timeZone: Joi.string().optional(),
    page: Joi.number().optional(),
    limit: Joi.number().optional(),
    matchName: Joi.optional(),
  }),
};

export default { fetchSportTotalPL, fetchSportEventList, fetchAviatorList, fetchIntCasinoList, fetchuserPLList, userEventsProfitlossAura,userMarketsProfitlossAura };
