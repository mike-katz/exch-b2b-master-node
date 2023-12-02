const mongoose = require('mongoose');
import * as plugin from "./plugins";

const { Schema } = mongoose;

const auracsplacebetSchema = new Schema({
 userId: {
    type: 'String',
    ref: "User",
  },
  matchName: {
    type: 'String',
  },
  marketName: {
    type: 'String',
  },
  marketType: {
    type: 'String',
  },
  calculateExposure: {
    type: 'Number',
  },
  exposureTime: {
    type: 'Number',
  },
  runners: {
    type: [
      'Mixed',
    ],
  },
  betInfo: {
    gameId: {
      type: 'String',
    },
    marketId: {
      type: 'String',
    },
    runnerId: {
      type: 'String',
    },
    runnerName: {
      type: 'String',
    },
    reqStake: {
      type: 'Number',
    },
    requestedOdds: {
      type: 'String',
    },
    pnl: {
      type: 'Number',
    },
    liability: {
      type: 'Number',
    },
    status: {
      type: 'String',
    },
    isBack: {
      type: 'Boolean',
    },
    roundId: {
      type: 'String',
    },
    marketName: {
      type: 'String',
    },
    orderId: {
      type: 'String',
    },
    pl: {
      type: 'Number',
    },
    betExposure: {
      type: 'Number',
    },
  },
  IsSettle: {
    type: 'Number',
  },
  IsVoid: {
    type: 'Number',
  },
  IsUnsettle: {
    type: 'Number',
  },
}, { timestamps: true });

auracsplacebetSchema.statics.POPULATED_FIELDS = [
  {
    path: "userId",
    select: "username",
  },
];

// add plugin that converts mongoose to json
auracsplacebetSchema.plugin(plugin.toJSON);
auracsplacebetSchema.plugin(plugin.paginate);

const AuraCSPlaceBet = mongoose.model("AuraCSPlaceBet", auracsplacebetSchema);
export default AuraCSPlaceBet;
