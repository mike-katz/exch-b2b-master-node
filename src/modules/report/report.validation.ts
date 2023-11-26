import * as Joi from "joi";

const fetchSportTotalPL = {
  query: Joi.object().keys({
    
  }),
};

const fetchSportEventList = {
  query: Joi.object().keys({ 
    sportName: Joi.string().optional(),
    exEventId: Joi.string().optional(),
    exMarketId: Joi.string().optional(),
    from: Joi.string().optional(),
    to: Joi.string().optional(),
    page: Joi.number().required(),
    limit: Joi.number().required(),
  }),
};

const fetchAviatorList = {
  query: Joi.object().keys({    
    from: Joi.string().optional(),
    to: Joi.string().optional(),
    page: Joi.number().required(),
    limit: Joi.number().required(),
  }),
};

export default { fetchSportTotalPL, fetchSportEventList, fetchAviatorList };
