import mongoose, { Schema } from "mongoose";
import * as plugin from "./plugins";
// import stakes from "@/config/stake";

const stakeSchema = new Schema({
  username: {
    type: String,
  },
  stakes: [{
    type: Number,
    // default: stakes,
  }],
}, { timestamps: true });

stakeSchema.plugin(plugin.toJSON);

const Stake = mongoose.model('Stake', stakeSchema);
export default Stake;
