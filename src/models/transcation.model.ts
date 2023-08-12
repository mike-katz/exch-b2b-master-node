const mongoose = require('mongoose');
import * as plugin from "./plugins";

const { Schema, Types } = mongoose;

const transcationSchema = new Schema({
  fromId: { //login id
    type: Types.ObjectId,
    ref: "User",
    required: true,
  },
  toId: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
  },
  balance: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  remark: {
    type: String,    
  },
  newBalance: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

// add plugin that converts mongoose to json
transcationSchema.plugin(plugin.toJSON);
transcationSchema.plugin(plugin.paginate);

transcationSchema.statics.POPULATED_FIELDS = [
  {
    path: "fromId",
    select: "username",
  },
  {
    path: "toId",
    select: "username",
  },
];

const Transcation = mongoose.model("Transcation", transcationSchema);
export default Transcation;
