import * as Joi from "joi";

const fetchActivity = {
  body: Joi.object().keys({}),
};
export default { fetchActivity };
