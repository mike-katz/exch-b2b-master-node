import * as Joi from "joi";

const fetchMarket = {
  query: Joi.object().keys({
    userId: Joi.string().optional(),
  }),
};
export default { fetchMarket };
