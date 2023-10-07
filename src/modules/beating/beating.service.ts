import { CricketBetPlace, CricketPL, Sport, User, BetLock, BetLockLog } from "@/models"
import ApiError from "@/utils/ApiError";
import httpStatus from "http-status";
import { MongoClient } from 'mongodb';
import configs from "@/config/config";
import { checkParent } from "@/modules/user/user.service";
const client = new MongoClient(configs.mongoose.url);

const bettingHistory = async (data: any, filter: any, options: any): Promise<void> => {
  try {
    let username = data?.username;
    if (filter?.userId && filter?.userId != "") {
      const user = await checkParent(filter?.userId, data?._id);
      username = user?.username
      delete filter.userId
    }
    filter.username = username;

    if (filter?.from && filter?.from != "" && filter?.to && filter?.to != "") {
      delete filter.createdAt
      const date1: any = new Date(filter?.from);
      const date2: any = new Date(filter?.to);
      date2.setHours(23, 59, 59, 999);
      const timeDifferenceMs = date2 - date1;
      const millisecondsIn15Days = 1000 * 60 * 60 * 24 * 15;
      if (timeDifferenceMs >= millisecondsIn15Days) {
        throw new ApiError(httpStatus.BAD_REQUEST, {
          msg: "Please select only 15 days range only.",
        });
      }
      filter.createdAt = {
        $gte: new Date(date1),
        $lte: new Date(date2),
      };

      delete filter.to
      delete filter.from
    }
    if (filter?.to) {
      filter.createdAt = new Date(filter.to);
      delete filter.to
    }

    if (filter?.from) {
      filter.createdAt = new Date(filter.from);
      delete filter.from
    }

    if (filter.status) {
      filter.status == "settle" ? filter.IsSettle = 1 : (filter.status == "unsettle" ? filter.IsUnsettle = 1 : filter.IsVoid = 1)
      delete filter.status;
    }

    let datas: any = await CricketBetPlace.paginate(filter, options)
    const resData: any = [];
    datas?.results.forEach((item: any) => {
      const itemData = {
        username: item?.username,
        odds: item.odds > 0 ? parseFloat(item.odds.toString()) : 0,
        pl: item.pl > 0 ? parseFloat(item.pl.toString()) : 0,
        _id: item?._id,
        stake: item?.stake,
        type: item?.type,
        eventName: item?.eventName,
        selectionName: item?.selectionName,
        marketType: item?.marketType,
        createdAt: item?.createdAt,
        updatedAt: item?.updatedAt,
        selectionId: item?.selectionId,
        sportName: item?.sportName || "",
      };
      resData.push(itemData);
    }),
      datas.results = resData
    const sumData: any = await CricketBetPlace.aggregate([
      {
        $match: {
          $and: [filter]
        }
      },
      {
        $group: {
          _id: null,
          totalStake: { $sum: { $toInt: "$stake" } }
        }
      }
    ]);

    datas.sum = sumData;
    return datas;
  }
  catch (error: any) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg || "invalid user id.",
    });
  }
}

const profitLoss = async (data: any, filter: any, options: any): Promise<void> => {
  try {
    let username = data?.username;
    if (filter?.userId && filter?.userId != "") {
      const user = await checkParent(filter?.userId, data?._id);
      username = user?.username
      delete filter.userId
    }
    filter.username = username;

    if (filter?.from && filter?.from != "" && filter?.to && filter?.to != "") {
      delete filter.createdAt
      const date1: any = new Date(filter?.from);
      const date2: any = new Date(filter?.to);
      date2.setHours(23, 59, 59, 999);
      const timeDifferenceMs = date2 - date1;
      const millisecondsIn15Days = 1000 * 60 * 60 * 24 * 15;
      if (timeDifferenceMs >= millisecondsIn15Days) {
        throw new ApiError(httpStatus.BAD_REQUEST, {
          msg: "Please select only 15 days range only.",
        });
      }
      filter.createdAt = {
        $gte: new Date(date1),
        $lte: new Date(date2),
      };

      delete filter.to
      delete filter.from
    }

    if (filter?.to) {
      filter.createdAt = new Date(filter.to);
      delete filter.to
    }

    if (filter?.from) {
      filter.createdAt = new Date(filter.from);
      delete filter.from
    }
    const datas: any = await CricketBetPlace.paginate(filter, options)
    const resData: any = [];
    datas?.results.forEach((item: any) => {
      const itemData = {
        username: item?.username,
        odds: item.odds > 0 ? parseFloat(item.odds.toString()) : 0,
        pl: item.pl > 0 ? parseFloat(item.pl.toString()) : 0,
        _id: item?._id,
        stake: item?.stake,
        type: item?.type,
        eventName: item?.eventName,
        selectionName: item?.selectionName,
        marketType: item?.marketType,
        createdAt: item?.createdAt,
        updatedAt: item?.updatedAt,
        selectionId: item?.selectionId,
        sportName: item?.sportName || "",
      };

      resData.push(itemData);
    }),

      datas.results = resData
    return datas;
  } catch (error: any) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg || "invalid user id.",
    });
  }
}

const transaction = async (data: any): Promise<void> => {
  return;
}

const getSports = async (): Promise<void> => {
  const data: any = await Sport.find({
    sportId: {
      $type: 'string', // Match only string values
      $regex: /^[0-9]+(\.[0-9]*)?$/, // Use regex to match numeric values
    },
  }).sort({ _id: -1 });
  return data;
}

const betList = async (data: any, filter: any, options: any): Promise<void> => {
  try {
    const users = await User.find({ roles: { $in: ['User'] }, parentId: { $in: [data._id] } }).select('username');
    const usernames = users.map(user => user.username);

    filter.username = { $in: usernames };
    if (filter?.from && filter?.from != "" && filter?.to && filter?.to != "") {
      delete filter.createdAt
      const date1: any = new Date(filter?.from);
      const date2: any = new Date(filter?.to);
      date2.setHours(23, 59, 59, 999);
      const timeDifferenceMs = date2 - date1;
      const millisecondsIn15Days = 1000 * 60 * 60 * 24 * 15;
      if (timeDifferenceMs >= millisecondsIn15Days) {
        throw new ApiError(httpStatus.BAD_REQUEST, {
          msg: "Please select only 15 days range only.",
        });
      }
      filter.createdAt = {
        $gte: new Date(date1),
        $lte: new Date(date2),
      };

      delete filter.to
      delete filter.from
    }
    if (filter?.to) {
      filter.createdAt = new Date(filter.to);
      delete filter.to
    }

    if (filter?.from) {
      filter.createdAt = new Date(filter.from);
      delete filter.from
    }

    if (filter.status) {
      filter.status == "settle" ? filter.IsSettle = 1 : (filter.status == "unsettle" ? filter.IsUnsettle = 1 : filter.IsVoid = 1)
      delete filter.status;
    }

    let datas: any = await CricketBetPlace.paginate(filter, options)
    const resData: any = [];
    datas?.results.forEach((item: any) => {
      const itemData = {
        username: item?.username,
        odds: item.odds > 0 ? parseFloat(item.odds.toString()) : 0,
        pl: item.pl > 0 ? parseFloat(item.pl.toString()) : 0,
        _id: item?._id,
        stake: item?.stake,
        type: item?.type,
        eventName: item?.eventName,
        selectionName: item?.selectionName,
        marketType: item?.marketType,
        createdAt: item?.createdAt,
        updatedAt: item?.updatedAt,
        selectionId: item?.selectionId,
        sportName: item?.sportName || "",
      };
      resData.push(itemData);
    }),
      datas.results = resData
    return datas;
  }
  catch (error: any) {
    console.log("error", error);

    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg || "invalid user id.",
    });
  }
}

const matchBet = async (data: any, eventId: string, options: any): Promise<void> => {
  const users = await User.find({ roles: { $in: ['User'] }, parentId: { $in: [data._id] } }).select('username');
  const usernames = users.map(user => user.username);

  const { limit = 10, page = 1 } = options;
  const skip = (page - 1) * limit;

  const betData = await CricketBetPlace.aggregate([
    {
      $match: {
        $and: [{ username: { $in: usernames } },
        { IsUnsettle: 1 },
        { exEventId: eventId }]
      }
    },
    {
      $skip: skip,
    },
    {
      $limit: parseInt(limit),
    },
    { $sort: { _id: -1 } }
  ]);

  const totalResults = await CricketBetPlace.countDocuments({ username: { $in: usernames }, IsUnsettle: 1, exEventId: eventId });
  let results: any = []
  if (betData.length > 0) {
    betData.forEach((item: any) => {
      const news = { ...item };
      news.pl = item.pl > 0 ? parseFloat(item.pl.toString()) : 0,
        news.odds = item.odds > 0 ? parseFloat(item.odds.toString()) : 0,
        results.push(news)
    });
  }
  const resData: any = {
    page,
    limit,
    totalPages: Math.ceil(totalResults / limit),
    totalResults,
    results
  };
  return resData;
}

const betPL = async (data: any, eventId: string): Promise<void> => {
  const users = await User.find({
    roles: { $in: ['User'] },
    parentId: { $in: [data._id] }
  }).select('username');
  const usernames = users.map(user => user.username);
  const result: any = await CricketPL.find({
    exEventId: eventId,
    username: { $in: usernames }
  });

  if (result.length > 0) {
    const outputJson: any = [];
    const marketIdMap = new Map();
    result.forEach((item: any) => {
      const { exMarketId, selectionId } = item;
      if (!marketIdMap.has(exMarketId)) {
        marketIdMap.set(exMarketId, selectionId);
      } else {
        const existingSelection = marketIdMap.get(exMarketId);
        for (const i in selectionId) {
          for (const key in selectionId[i]) {
            existingSelection[i][key] += selectionId[i][key];
          }
        }
      }
    });
    let index = 0;
    marketIdMap.forEach((selectionId, exMarketId) => {
      const updatedItem = {
        _id: result[index]?._id,
        username: result[index]?.username,
        exEventId: result[index]?.exEventId,
        type: result[index]?.type,
        exMarketId,
        selectionId
      };
      index++;
      outputJson.push(updatedItem);
    });
    return outputJson;
  }
  return result;
}

const betLock = async (data: any, eventId: string, type: string, status: string): Promise<void> => {

  if (status == "lock" && (type == "market" || type == "sport")) {
    await BetLock.create({
      userId: data?._id,
      eventId,
      type
    })
  }

  if (status == "lock" && type == "event") {
    await client.connect();
    let markets: any = await client.db(process.env.EXCH_DB).collection('marketRates').find({ 'exEventId': eventId });
    markets = await markets.toArray();

    let insArr = [{
      userId: data?._id,
      eventId,
      type
    }];
    if (markets?.length > 0) {
      markets?.map((item: any) => {
        insArr.push({
          userId: data?._id,
          eventId: item?.exMarketId,
          type: 'market'
        })
      })
    }
    await BetLock.insertMany(insArr)
  }

  if (status == "unlock" && type == "event") {
    await client.connect();
    let markets: any = await client.db(process.env.EXCH_DB).collection('marketRates').find({ 'exEventId': eventId });
    markets = await markets.toArray();

    let events = [eventId];
    if (markets?.length > 0) {
      markets?.map((item: any) => events.push(item?.exMarketId)
      )
    }
    await BetLock.deleteMany({ eventId: { $in: events }, userId: data?._id })
  }

  if (status == "unlock" && (type == "market" || type == "sport")) {
    const found: any = await BetLock.deleteOne({ eventId, userId: data?._id })
    if (!found) throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: "record not found",
    });
  }
  const log: any = await BetLockLog.create({
    username: data?.username,
    eventId,
    type,
    status
  })
  return log;
}

const betLockLog = async (data: any): Promise<void> => {
  const result: any = await BetLockLog.find({ username: data?.username })
  return result
}
export {
  bettingHistory,
  profitLoss,
  getSports,
  transaction,
  betList,
  matchBet,
  betPL,
  betLock,
  betLockLog
}