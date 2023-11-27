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
export default { saveNews, getThemes };
