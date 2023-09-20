const mongoose = require('mongoose');
import * as plugin from "./plugins";

const { Schema, Types } = mongoose;

const transcationSchema = new Schema({
  sender_id: { //login id
    type: String,
    ref: "User",
    required: true,
  },
  receiver_id: {
    type: String,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
  },
  message: {
    type: String,
  },
  method: {
    type: String,
  },
  username: {
    type: String
  },
  balance: {
    type: Number
  },
  remark: {
    type: String
  }
}, { timestamps: true });

// add plugin that converts mongoose to json
transcationSchema.plugin(plugin.toJSON);
transcationSchema.plugin(plugin.paginate);

transcationSchema.statics.POPULATED_FIELDS = [
  {
    path: "sender_id",
    select: "username",
  },
  {
    path: "receiver_id",
    select: "username",
  },
];

const B2cBankingLog = mongoose.model("B2cBankingLog", transcationSchema);
export default B2cBankingLog;
