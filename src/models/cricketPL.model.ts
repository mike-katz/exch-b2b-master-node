import mongoose,{ Schema } from 'mongoose';

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

const CricketPL = mongoose.model("CricketPL", cricketPLSchema);
export default CricketPL;
