import mongoose,{ Schema } from 'mongoose';

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

const SoccerPL = mongoose.model("SoccerPL", soccerPLSchema);
export default SoccerPL;
