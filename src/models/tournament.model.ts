import mongoose, { Schema } from "mongoose";
import * as plugin from "./plugins";

const tournamentSchema = new Schema({
 tournamentId: {
    type: String,
    required: true,
  },
  sportId: {
    type: String,
  },
  tournamentName: {
    type: String,
  },
  highlight: {
    type: Boolean,
  },
  quicklink: {
    type: Boolean,
  },
  status: {
    type: Boolean,
  },
  sequence: {
    type: String,
  },
}, { timestamps: true });

tournamentSchema.plugin(plugin.toJSON);

const Tournament = mongoose.model('Tournament', tournamentSchema);
export default Tournament;
