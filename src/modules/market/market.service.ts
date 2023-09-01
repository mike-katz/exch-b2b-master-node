import ApiError from "@/utils/ApiError";
import httpStatus from "http-status";
import { MongoClient } from 'mongodb';
import configs from "@/config/config";

const fetchMarket = async (): Promise<void> => {
  try {
    const client = new MongoClient(configs.mongoose.url);
    await client.connect();
    console.log("process.env.EXCH_DB",process.env.EXCH_DB);
    
    const data: any = await client.db(process.env.EXCH_DB).collection('marketRates').aggregate([
      {
    $group: {
      _id: "$sportName",
      events: {
        $push: {
          _id: "$_id",
          eventName: "$eventName",
        },
      },
    },
  },
  {
    $project: {
      _id: 0,
      sportName: "$_id",
      events: 1,
    },
  },
  {
    $unwind: "$events",
  },
  {
    $group: {
      _id: "$sportName",
      events: {
        $push: "$events",
      },
    },
  },
  {
    $sort: {
      "_id": 1,
    },
  },
    ]);
    const results = await data.toArray();
    return results;
  } catch (error: any) {
    console.log("error", error);

    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg || "invalid user id.",
    });
  }
}

export { fetchMarket }