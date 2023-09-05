import mongoose, { Schema } from "mongoose";
import * as plugin from "./plugins";

const eventSchema = new Schema({
  eventId: {
    type: String,
    required: true,
  },
  exEventId: {
    type: String,
  },
  sportId: {
    type: String,
  },
  tournamentsId: {
    type: String,
  },
  eventName: {
    type: String,
  },
  highlight: {
    type: Boolean,
  },
  quicklink: {
    type: Boolean,
  },
  popular: {
    type: Boolean,
  },
}, { timestamps: true });

eventSchema.plugin(plugin.toJSON);

const Event = mongoose.model('Event', eventSchema);
export default Event;
