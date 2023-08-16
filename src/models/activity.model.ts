import mongoose,{ Schema } from 'mongoose';

const activitySchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  ip: {
    type: String,
    required: true,
  },
  detail: {
    type: String,
    required: true,
 }
}, { timestamps: true });

const Activity = mongoose.model("Activity", activitySchema);
export default Activity;
