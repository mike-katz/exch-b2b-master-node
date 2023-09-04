import mongoose,{ Schema } from 'mongoose';

const betLockSchema = new Schema({
  userId: {
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
}, { timestamps: true });

const BetLock = mongoose.model("BetLock", betLockSchema);
export default BetLock;
