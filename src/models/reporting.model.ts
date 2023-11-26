const mongoose = require('mongoose');
import * as plugin from "./plugins";

const { Schema, Types } = mongoose;

const reportingBetSchema = new Schema({
 sportId: {
    type: String,
  },
  sportName: {
    type: String,
  },
  exEventId: {
    type: String,
  },
  eventName: {
    type: String,
  },
  exMarketId: {
    type: String,
  },
  result: {
    type: String,
  },
  username: {
    type: String,
  },
  pl: {
    type: Number,
  },
  stack: {
    type: Number,    
  },
  commission: {
    type: Number,
  },
  marketName: {
    type: String,
  },
}, { timestamps: true });

// add plugin that converts mongoose to json
reportingBetSchema.plugin(plugin.toJSON);
reportingBetSchema.plugin(plugin.paginate);

const Reporting = mongoose.model("Reportings", reportingBetSchema);
export default Reporting;
