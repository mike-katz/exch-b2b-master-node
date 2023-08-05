import * as Joi from "joi";

const fetchActivity = {
  body: Joi.object().keys({
    userId: Joi.string().optional(),
  }),
};
export default { fetchActivity };
