import * as Joi from "joi";

const saveNews = {
  body: Joi.object().keys({
  news: Joi.string().required(),
  origin: Joi.optional(),
  }),
};

export default { saveNews };
