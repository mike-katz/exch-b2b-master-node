const mongoose = require('mongoose');

const { Schema } = mongoose;

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
