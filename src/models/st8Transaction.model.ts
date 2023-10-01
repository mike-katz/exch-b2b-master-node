const mongoose = require('mongoose');
import * as plugin from "./plugins";

const { Schema, Types } = mongoose;

const st8TransactionSchema = new Schema({
 username: {
    type: String,
  },
  amount: {
    type: Number,
    default: 0
  },
  pl: {
    type: Number,
    default: 0
  },
  developer_code: {
    type: String,
  },
  game_code: {
    type: String,
  },
  round: {
    type: String,
  },
  player: {
    type: String,
  },
  bonus: {
    type: Number,
    default: 0
  },
  processed_at: {
    type: String,
  },
  gameName: {
    type: String
  },
  categoryName: {
    type: String,
  },
}, { timestamps: true });

// add plugin that converts mongoose to json
st8TransactionSchema.plugin(plugin.toJSON);
st8TransactionSchema.plugin(plugin.paginate);

const St8Transaction = mongoose.model("St8Transaction", st8TransactionSchema);
export default St8Transaction;
