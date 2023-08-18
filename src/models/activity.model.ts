import mongoose,{ Schema } from 'mongoose';

const activityLogSchema = new Schema({
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
  },
  status: {
    type: String,
    required: true,
  }
}, { timestamps: true });

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
export default ActivityLog;
