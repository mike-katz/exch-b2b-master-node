import * as Joi from "joi";

const saveNews = {
  body: Joi.object().keys({
  news: Joi.optional(),
  origin: Joi.optional(),
  }),
};

const getThemes = {
  body: Joi.object().keys({
  
  }),
};

const getSpredexIds = {
  query: Joi.object().keys({
    eventId: Joi.string().required()
  }),
};


export default { saveNews, getThemes, getSpredexIds };
