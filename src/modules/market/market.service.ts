import ApiError from "@/utils/ApiError";
import httpStatus from "http-status";
import { MongoClient } from 'mongodb';
import configs from "@/config/config";
import { StreamShedule } from "@/models";
const client = new MongoClient(configs.mongoose.url);
        
const fetchMarket = async (): Promise<void> => {
  await client.connect();
  try {
    const data: any = await client.db(process.env.EXCH_DB).collection('marketRates').aggregate([
      {
    $group: {
      _id: "$sportName",
      events: {
        $push: {
          exEventId: "$exEventId",
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

const getMarketDetail= async(eventId: string):Promise<void> => {
  await client.connect();
    const cursor = await client.db(process.env.EXCH_DB).collection('marketRates')
      .find({ exEventId: eventId });
    const result:any = await cursor.toArray();
  return result;
  } 

const getStream= async(eventId: string):Promise<any> => {
  
  const profile = await StreamShedule.findOne({ MatchID: eventId }).select('Channel').exec();
  if (!profile) return { Channel: null };
  return profile;
  } 
export { fetchMarket, getMarketDetail, getStream}