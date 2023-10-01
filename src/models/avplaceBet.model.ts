const mongoose = require('mongoose');
import * as plugin from "./plugins";

const { Schema } = mongoose;

const avplaceBetSchema = new Schema({
 user: {
    type: String,
  },
  currency: {
    type: String,
  },
  stack: {
    type: Number,
  },
  provider: {
    type: String,
  },
  provider_tx_id: {
    type: String,
  },
  game: {
    type: String,
  },
  action: {
    type: String,
  },
  action_id: {
    type: Number,
  },
  issettled: {
    type: Number,
    default: 0,
  },
  isunsetted: {
    type: Number,
    default: 1,
  },
  operator_tx_id: {
    type: String,
  },
  isVoid: {
    type: Number,
    default: 0,
  },
  pl: {
    type: Number,
    default: 0,
  },
  sportId: {
    type: String,
  },
  sportName: {
    type: String,
  },
}, { timestamps: true });

// add plugin that converts mongoose to json
avplaceBetSchema.plugin(plugin.toJSON);
avplaceBetSchema.plugin(plugin.paginate);

const Avplacebet = mongoose.model("Avplacebet", avplaceBetSchema);
export default Avplacebet;
