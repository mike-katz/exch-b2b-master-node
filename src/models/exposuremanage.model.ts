import mongoose,{ Schema } from 'mongoose';

const exposureManageSchema = new Schema({
  exEventId: {
    type: String,
  },
  exMarketId: {
    type: String,
  },
  username: {
    type: String,
  },
  exposure: {
    type: String,
  },
}, { timestamps: true });

const ExposureManage = mongoose.model("ExposureManage", exposureManageSchema);
export default ExposureManage;
