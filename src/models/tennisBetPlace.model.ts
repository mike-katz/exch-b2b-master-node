import mongoose, { Schema } from "mongoose";
import { paginate, toJSON } from "./plugins";
function getdecimal(value: Number) {
  if (typeof value !== 'undefined') {
    return parseFloat(value.toString());
  }
  return value;
}

const tennisbetplaceSchema = new Schema({
   username: {
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
  marketType: {
    type: String,
  },
  stake: {
    type: String,
  },
  odds: {
    type: Schema.Types.Decimal128,
    get: getdecimal,
  },
  pl: {
    type: Schema.Types.Decimal128,
    get: getdecimal,
  },
  selectionId: {
    type: String,
  },
  selectionName: {
    type: String,
  },
  type: {
    type: String,
  },
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
    default: 1,
  },
  sportId: {
    type: String,
    ref: 'Sport',
  },
  sportName: {
    type: String,
    ref: 'Sport',
  },
}, { timestamps: true });
// add plugin that converts mongoose to json
tennisbetplaceSchema.plugin(toJSON);
tennisbetplaceSchema.plugin(paginate);

const TennisBetPlace: any = mongoose.model<any>("TennisBetPlace", tennisbetplaceSchema);

export default TennisBetPlace;
