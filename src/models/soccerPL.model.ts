import mongoose,{ Schema } from 'mongoose';
import * as plugin from "./plugins";

const soccerPLSchema = new Schema({
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

soccerPLSchema.plugin(plugin.toJSON);
soccerPLSchema.plugin(plugin.paginate);

const SoccerPL: any = mongoose.model<any>("SoccerPL", soccerPLSchema);
export default SoccerPL;
