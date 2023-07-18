import * as Joi from "joi";

const fetchUserProfile = {
  body: Joi.object().keys({}),
};
export default { fetchUserProfile };
