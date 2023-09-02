import mongoose, { Schema } from "mongoose";
import * as plugin from "./plugins";

const StreamSheduleSchema = new Schema({
   MatchID: {
    type: Number,
  },
  Channel: {
    type: String,
  },
  Name: {
    type: String,
  },
  Home: {
    type: String,
  },
  Away: {
    type: String,
  },
  Type: {
    type: String,
  },
  League: {
    type: String,
  },
  bid: {
    type: String,
  },
  TimeStart: {
    type: String,
  },
  NowPlaying: {
    type: Number,
  },
  IsLive: {
    type: Number,
  },
  State: {
    type: String,
  },
  UTCTimeStart: {
    type: Number,
  },
});

StreamSheduleSchema.plugin(plugin.toJSON);

const StreamShedule = mongoose.model('StreamShedule', StreamSheduleSchema);
export default StreamShedule;
