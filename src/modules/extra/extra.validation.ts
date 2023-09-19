import * as Joi from "joi";

const saveNews = {
  body: Joi.object().keys({
  news: Joi.optional(),
  origin: Joi.optional(),
  }),
};

export default { saveNews };
