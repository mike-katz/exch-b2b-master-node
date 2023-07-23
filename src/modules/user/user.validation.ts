import * as Joi from "joi";

const fetchUserProfile = {
  body: Joi.object().keys({}),
};


const fetchUserDownline = {
  body: Joi.object().keys({
    userId: Joi.optional(),
  }),
};

export default { fetchUserProfile,fetchUserDownline };
