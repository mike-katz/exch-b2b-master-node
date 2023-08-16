import mongoose,{ Schema } from 'mongoose';

const creditLogSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  old: {
    type: Number,
    required: true,
  },
  new: {
    type: Number,
    required: true,
 }
}, { timestamps: true });

const CreditLog = mongoose.model("CreditLog", creditLogSchema);
export default CreditLog;
