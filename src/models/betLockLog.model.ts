import mongoose,{ Schema } from 'mongoose';

const betLockLogSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  eventId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  }
}, { timestamps: true });

const BetLock = mongoose.model("BetLockLog", betLockLogSchema);
export default BetLock;
