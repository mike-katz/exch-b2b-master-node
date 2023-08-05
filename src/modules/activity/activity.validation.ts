import * as Joi from "joi";

const fetchActivity = {
  query: Joi.object().keys({
    userId: Joi.string().optional(),
  }),
};
export default { fetchActivity };
