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
      msg: error?.errorData?.msg || "something want wrong.",
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

const getEvents = async (user: any): Promise<any> => {
  const userIds = [user._id.toString()];
  if (Array.isArray(user.parentId)) userIds.concat(user.parentId)
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
      $lookup: {
        from: 'tournaments',
        localField: 'sportId',
        foreignField: 'sportId',
        as: 'tournament',
      },
    },

    {
      $project: {
        id: '$sportId',
        name: '$sportName',
        iconUrl: 1,
        sequence: 1,
        children: {
          $map: {
            input: '$tournament',
            as: 'tournament',
            in: {
              id: '$$tournament.tournamentId',
              name: '$$tournament.tournamentName',
              _id: "$$tournament._id"
            },
          },
        },
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
  sportscopy = sportscopy.filter((value: any) => Object.keys(value).length !== 0);
  for (let key = 0; key < sportscopy.length; key += 1) {
    const { children } = sportscopy[key];
    if (children?.length > 0) {
      for (let i = 0; i < children.length; i += 1) {
        const events = await Event.aggregate([{
          $match: {
            tournamentsId: children[i].id,
          },
        },
        {
          $project: {
            exEventId: 1,
            eventName: 1,
          },
        },

        {
          $lookup: {
            from: 'betlocks',
            let: { eventId: '$exEventId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$eventId', '$$eventId'] },
                      { $in: ['$userId', userIds] },
                      { $eq: ['$type', 'event'] }
                    ],
                  },
                },
              },
            ],
            as: 'betLockInfo',
          },
        },
        {
          $addFields: {
            status: {
              $cond: {
                if: { $eq: [{ $size: '$betLockInfo' }, 0] },
                then: 'unlock',
                else: 'lock',
              },
            },
          },
        },
        //market rate process start
        {
          $lookup: {
            from: 'marketRates',
            localField: 'exEventId',
            foreignField: 'exEventId',
            as: 'childrenMarket'
          }
        },
        {
          $unwind: '$childrenMarket',
        },
        {
          $lookup: {
            from: 'betlocks',
            let: { eventId: '$childrenMarket.exMarketId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$eventId', '$$eventId'] },
                      { $in: ['$userId', userIds] },
                      { $eq: ['$type', 'market'] }
                    ],
                  },
                },
              },
            ],
            as: 'betLockInfoss',
          },
        },
        {
          $addFields: {
            marketStatus: {
              $cond: {
                if: { $eq: [{ $size: '$betLockInfoss' }, 0] },
                then: 'unlock',
                else: 'lock',
              },
            },
          },
        },
        {
          $group: {
            _id: '$exEventId',
            id: { $first: '$exEventId' },
            name: { $first: '$eventName' },
            status: { $first: '$status' },
            childrenMarket: {
              $push: {
                _id: '$childrenMarket._id',
                exMarketId: '$childrenMarket.exMarketId',
                marketName: '$childrenMarket.marketName',
                marketStatus: '$marketStatus',
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            id: 1,
            name: 1,
            status: 1,
            childrenMarket: 1,
          },
        },

        ]);
        if (events?.length > 0) {
          sportscopy[key].children[i].children = events;
        }
      }
    }
  }
 return sportscopy;
}


export { fetchMarket, getMarketDetail, getStream, getEvents }