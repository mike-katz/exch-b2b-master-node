import mongoose,{ Schema } from 'mongoose';
import * as plugin from "./plugins";

const tennisPLSchema = new Schema({
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
}, { timestamps: true });

// add plugin that converts mongoose to json
tennisPLSchema.plugin(plugin.toJSON);
tennisPLSchema.plugin(plugin.paginate);

const TennisPL: any = mongoose.model<any>("TennisPL", tennisPLSchema);
export default TennisPL;
