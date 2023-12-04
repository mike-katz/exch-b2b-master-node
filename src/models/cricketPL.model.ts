import mongoose, { Schema } from 'mongoose';

import * as plugin from "./plugins";

const cricketPLSchema = new Schema({
 exEventId: {
    type: String,
  },
  exMarketId: {
    type: String,
  },
  username: {
    type: String,
  },
  selectionId: [],
  IsSettle: {
    type: Number,
    default: 0,
  },
  IsVoid: {
    type: Number,
    default: 0,
  },
  IsUnsettle: {
    type: Number,
    default: 0,
  },
  type: {
    type: String,    
  }
}, { timestamps: true });

// add plugin that converts mongoose to json
cricketPLSchema.plugin(plugin.toJSON);
cricketPLSchema.plugin(plugin.paginate);

const CricketPL: any = mongoose.model<any>("CricketPL", cricketPLSchema);
export default CricketPL;
