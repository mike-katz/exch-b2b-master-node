import ApiError from "@/utils/ApiError";
import httpStatus from "http-status";
import { MongoClient } from 'mongodb';
import configs from "@/config/config";
import { Event, Sport, StreamShedule, Tournament } from "@/models";
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
              eventName: '$eventName',
              marketTime: '$marketTime'
            }
          }
        }
      },
      {
        $sort: {
          _id: 1
        }
      },

      {
        $unwind: '$events',
      },
      {
        $sort: {
          [`events.marketTime`]: -1,
        },
      },
      {
        $group: {
          _id: '$_id',
          sportName: { $first: '$sportName' },
          iconUrl: { $first: '$iconUrl' },
          events: {
            $push: {
              exEventId: '$events.exEventId',
              eventName: '$events.eventName',
            },
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
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


const getEvents = async (): Promise<any> => {

 const sportsresult = await Sport.aggregate([
      {
        $match: {
          sportId: {
            $not: {
              $in: ['home', 'in-play'],
            },
          },
        },
      },
      {
        $project: {
          sportId: 1,
          sportName: 1,
          iconUrl: 1,
          sequence: 1,
        },
      },
      {
        $addFields: {
          numericSequence: { $toInt: '$sequence' },
        },
      },
      {
        $sort: { numericSequence: 1 },
      },
    ]);
    let sportscopy = JSON.parse(JSON.stringify(sportsresult));
    for (let key = 0; key < sportsresult.length; key += 1) {
      const tournaments = await Tournament.aggregate([{
        $match: {
          sportId: sportsresult[key].sportId,
        },
      }, {
        $project: {
          tournamentId: 1,
          tournamentName: 1,
        },
      }]);
      if (tournaments?.length > 0) {
        sportscopy[key].tournaments = tournaments;
      }
    }
    sportscopy = sportscopy.filter((value:any) => Object.keys(value).length !== 0);
    for (let key = 0; key < sportscopy.length; key += 1) {
      const { tournaments } = sportscopy[key];
      if (tournaments?.length > 0) {
        for (let i = 0; i < tournaments.length; i += 1) {
          const events = await Event.aggregate([{
            $match: {
              tournamentsId: tournaments[i].tournamentId,
            },
          }, {
            $project: {
              exEventId: 1,
              eventName: 1,
            },
          }]);
          if (events?.length > 0) {
            sportscopy[key].tournaments[i].events = events;
          }
        }
      }
    }
    let json = JSON.parse(JSON.stringify(sportscopy).split('"sportId":').join('"id":'));
    json = JSON.parse(JSON.stringify(json).split('"sportName":').join('"name":'));
    json = JSON.parse(JSON.stringify(json).split('"tournaments":').join('"children":'));
    json = JSON.parse(JSON.stringify(json).split('"tournamentId":').join('"id":'));
    json = JSON.parse(JSON.stringify(json).split('"tournamentName":').join('"name":'));
    json = JSON.parse(JSON.stringify(json).split('"events":').join('"children":'));
    json = JSON.parse(JSON.stringify(json).split('"exEventId":').join('"id":'));
    json = JSON.parse(JSON.stringify(json).split('"eventName":').join('"name":'));
  return json;
}

export { fetchMarket, getMarketDetail, getStream, getEvents }