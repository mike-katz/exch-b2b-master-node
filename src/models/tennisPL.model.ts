import mongoose,{ Schema } from 'mongoose';

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

const TennisPL = mongoose.model("TennisPL", tennisPLSchema);
export default TennisPL;
