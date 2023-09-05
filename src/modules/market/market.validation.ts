import * as Joi from "joi";

const fetchMarket = {
  body: Joi.object().keys({
  }),
};

const getMarketDetail = {
  query: Joi.object().keys({
    eventId: Joi.string().optional(),
  }),
};

const getStream = {
  query: Joi.object().keys({
    eventId: Joi.string().optional(),
  }),
};

const getEvents = {
  body: Joi.object().keys({
  }),
};

export default { fetchMarket, getMarketDetail, getStream, getEvents};
