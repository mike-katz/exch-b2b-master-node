import ApiError from "@/utils/ApiError";
import httpStatus from "http-status";
import { MongoClient } from 'mongodb';
import configs from "@/config/config";
import { StreamShedule } from "@/models";
const client = new MongoClient(configs.mongoose.url);

const fetchMarket = async (): Promise<void> => {
  try {
    const pipeline = [
      {
        $lookup: {
          from: 'sports',
          localField: 'sportsId',
          foreignField: 'sportId',
          as: 'sportData'
        }
      },
      {
        $unwind: '$sportData'
      },
      {
        $group: {
          _id: '$sportsId',
          sportName: { $first: '$sportData.sportName' },
          iconUrl: { $first: '$sportData.iconUrl' },
          events: {
            $addToSet: {
              exEventId: '$exEventId',
              eventName: '$eventName'
            }
          }
        }
      },
      {
        $sort: {
          _id: 1
        }
      }
    ];

    await client.connect();
    const results: any = await client.db(process.env.EXCH_DB).collection('marketRates').aggregate(pipeline);
    return results.toArray();

  } catch (error: any) {
    console.log("error", error);

    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg || "invalid user id.",
    });
  }
}

const getMarketDetail = async (eventId: string): Promise<void> => {
  await client.connect();
  const cursor = client.db(process.env.EXCH_DB).collection('marketRates')
    .find({ exEventId: eventId });
  const result: any = await cursor.toArray();
  return result;
}

const getStream = async (eventId: string): Promise<any> => {

  const profile = await StreamShedule.findOne({ MatchID: eventId }).select('Channel').exec();
  if (!profile) return { Channel: null };
  return profile;
}
export { fetchMarket, getMarketDetail, getStream }