const mongoose = require('mongoose');
import * as plugin from "./plugins";

const { Schema } = mongoose;

const auracsresultsSchema = new Schema({
 result: {
    type: [
      'Mixed',
    ],
  },
  runners: {
    type: [
      'Mixed',
    ],
  },
  betvoid: {
    type: 'Boolean',
  },
  roundId: {
    type: 'String',
  },
  market: {
    createdBy: {
      type: 'String',
    },
    marketHeader: {
      type: 'String',
    },
    roundId: {
      type: 'String',
    },
    indexCard: {
      type: 'Array',
    },
    hash: {
      type: 'String',
    },
    salt: {
      type: 'String',
    },
    cards: {
      type: 'Array',
    },
    gamenature: {
      type: 'String',
    },
    _id: {
      type: 'ObjectId',
    },
    gameId: {
      type: 'Date',
    },
    marketRunner: {
      type: [
        'Mixed',
      ],
    },
    gameType: {
      type: 'String',
    },
    gameSubType: {
      type: 'String',
    },
    runnerType: {
      type: 'String',
    },
    stage: {
      type: 'Number',
    },
    timer: {
      type: 'Number',
    },
    isVoid: {
      type: 'Boolean',
    },
    createdAt: {
      type: 'Date',
    },
    updatedAt: {
      type: 'Date',
    },
    __v: {
      type: 'Number',
    },
    marketValidity: {
      type: 'Number',
    },
    status: {
      type: 'String',
    },
  },
  operatorId: {
    type: 'String',
  },
}, { timestamps: true });

// add plugin that converts mongoose to json
auracsresultsSchema.plugin(plugin.toJSON);
auracsresultsSchema.plugin(plugin.paginate);

const AuraCSResult = mongoose.model("AuraCSResult", auracsresultsSchema);
export default AuraCSResult;
