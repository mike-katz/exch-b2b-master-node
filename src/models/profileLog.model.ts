const mongoose = require('mongoose');
import * as plugin from "./plugins";

const { Schema, Types } = mongoose;

const profileLogSchema = new Schema({
  fromUser: { //login id
    type: String,
    required: true,
  },
  toUser: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  old: {
    type: String,    
  },
  new: {
    type: String,    
  },
}, { timestamps: true });

// add plugin that converts mongoose to json
profileLogSchema.plugin(plugin.toJSON);
profileLogSchema.plugin(plugin.paginate);

const ProfileLog = mongoose.model("ProfileLog", profileLogSchema);
export default ProfileLog;
