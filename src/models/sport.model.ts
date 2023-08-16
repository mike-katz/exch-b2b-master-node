import mongoose, { Schema } from "mongoose";
import * as plugin from "./plugins";
// import stakes from "@/config/stake";

const sportSchema = new Schema({
  sportId: {
    type: String,
    required: true,
  },
  sportName: {
    type: String,
  },
  highlight: {
    type: Boolean,
  },
  popular: {
    type: Boolean,
  },
  other: {
    type: Boolean,
  },
  status: {
    type: Boolean,
  },
  sequence: {
    type: String,
  },
  iconUrl: {
    type: String,
  },
  url: {
    type: String,
  }
});

sportSchema.plugin(plugin.toJSON);

const Sport = mongoose.model('Sport', sportSchema);
export default Sport;
