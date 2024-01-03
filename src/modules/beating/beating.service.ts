import { CricketBetPlace, CricketPL, TennisPL, SoccerPL, Sport, User, BetLock, BetLockLog, Avplacebet, AuraCSPlaceBet, St8Transaction, TennisBetPlace, SoccerBetPlace } from "@/models"
import ApiError from "@/utils/ApiError";
import httpStatus from "http-status";
import { MongoClient } from 'mongodb';
import configs from "@/config/config";
import { checkParent } from "@/modules/user/user.service";
const client = new MongoClient(configs.mongoose.url);

const bettingHistory = async (data: any, filter: any, options: any): Promise<void> => {
  try {
    let username = data?.username;
    let userId = filter?.userId;
    if (userId && userId != "") {
      const user = await checkParent(userId, data?._id);
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

    if (filter.marketType) {
      if (filter.marketType === 'fancy') {
        filter.mrktType = { $in: ['fancy', 'line_market'] };
      } else {
        filter.mrktType = filter.marketType;
      }
      delete filter.marketType;
    }

    let resData;

    if (filter.sportName === 'Aviator') {
      // delete filter.mrktType;
      delete filter.username;
      filter.user = username;
      resData = await Avplacebet.paginate(filter, options);
    } else if (filter.sportName === 'Casino') {
      // delete filter.mrktType;
      delete filter.username;
      delete filter.sportName;
      filter.userId = userId.toString();
      resData = await AuraCSPlaceBet.paginate(filter, options);
    } else if (filter.sportName === 'Int Casino') {
      // delete filter.mrktType;
      // delete filter.IsSettle;
      // delete filter.IsUnsettle;
      // delete filter.IsVoid;
      delete filter.sportName;
      resData = await St8Transaction.paginate(filter, options);
    } else {
      resData = await CricketBetPlace.paginate(filter, options);
      if (resData.results.length === 0) {
        resData = await TennisBetPlace.paginate(filter, options);
      }
      if (resData.results.length === 0) {
        resData = await SoccerBetPlace.paginate(filter, options);
      }
    }

    const respData: any = [];
    resData?.results.forEach((item: any) => {
      const itemData = {
        username: item?.username,
        odds: item?.betInfo?.requestedOdds || item?.odds || 0,
        pl: item?.betInfo?.pnl || (item?.pl != '' ? parseFloat(item?.pl?.toString()) : 0),
        _id: item?._id,
        stake: item?.stake || item?.stack || item?.betInfo?.reqStake || item?.amount || 0,
        type: item?.type ? item?.type : (item?.betInfo?.isBack ? 'back' : 'lay') || '-',
        eventName: item?.eventName ? item?.eventName : item?.matchName || item?.gameName || '-',
        selectionName: item?.selectionName ? item?.selectionName : item?.betInfo?.runnerName || '-',
        marketType: item?.marketName || item?.marketType || item?.categoryName || '-',
        createdAt: item?.createdAt,
        updatedAt: item?.updatedAt,
        selectionId: item?.selectionId || '-',
        sportName: item?.sportName || '',
        size: item?.size || '',
        matchedTime: item.matchedTime || item?.updatedAt || ''
      };
      respData.push(itemData);
    }),
      resData.results = respData
    return resData;
  }
  catch (error: any) {
    console.log("error", error);

    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg || "internal server error.",
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
    const userIds = users.map(user => user._id.toString());
    const sportName = filter.sportName
    const search = filter.search
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

    if (filter.marketType) {
      if (filter.marketType === 'fancy') {
        filter.mrktType = { $in: ['fancy', 'line_market'] };
      } else {
        filter.mrktType = filter.marketType;
      }
      delete filter.marketType;
    }

    if (filter.search !== undefined && filter.search != "") {
      const regexSearch = new RegExp(filter.search, 'i');
      filter.$or = [
        { eventName: regexSearch },
        { selectionName: regexSearch },
        { username: regexSearch },
        { marketType: regexSearch },
      ]
      delete filter.search
    }

    let resData: any = [];
    if (filter.sportName === 'Aviator') {
      // delete filter.mrktType;
      delete filter.$or;
      delete filter.username;
      filter.user = usernames;

      if (search !== undefined && search != "") {
        const regexSearch = new RegExp(search, 'i');
        filter.$or = [
          { user: regexSearch }
        ]
      }

      resData = await Avplacebet.paginate(filter, options);
    } else if (filter.sportName === 'Casino') {
      // delete filter.mrktType;
      delete filter.$or;
      delete filter.username;
      delete filter.sportName;

      if (search !== undefined && search != "") {
        const regexSearch = new RegExp(search, 'i');
        filter.$or = [
          { matchName: regexSearch },
          { marketName: regexSearch },
          { userName: regexSearch }
        ]
      }
      filter.userId = userIds;
      const optObj = {
      ...options,
      path: AuraCSPlaceBet.POPULATED_FIELDS,
      };
      
      resData = await AuraCSPlaceBet.paginate(filter, optObj);
    } else if (filter.sportName === 'Int Casino') {
      // delete filter.mrktType;
      // delete filter.IsSettle;
      // delete filter.IsUnsettle;
      // delete filter.IsVoid;
      delete filter.sportName;
      delete filter.$or;
      if (search !== undefined && search != "") {
        const regexSearch = new RegExp(search, 'i');
        filter.$or = [
          { gameName: regexSearch },
          { categoryName: regexSearch },
          { userName: regexSearch }
        ]
      }
      resData = await St8Transaction.paginate(filter, options);
    } else {
      resData = await CricketBetPlace.paginate(filter, options);
      if (resData.results.length === 0) {
        resData = await TennisBetPlace.paginate(filter, options);
      }
      if (resData.results.length === 0) {
        resData = await SoccerBetPlace.paginate(filter, options);
      }
    }

    const respData: any = [];
    resData?.results.forEach((item: any) => {
      const itemData = {
        username: item?.username || item?.user || item?.userId?.username || "",
        odds: item?.betInfo?.requestedOdds || item?.odds || 0,
        pl: item?.betInfo?.pnl || (item?.pl != '' ? parseFloat(item?.pl?.toString()) : 0),
        _id: item?._id,
        stake: item?.stake || item?.stack || item?.betInfo?.reqStake || item?.amount || 0,
        type: item?.type ? item?.type : (item?.betInfo?.isBack ? 'back' : 'lay') || '-',
        eventName: item?.eventName ? item?.eventName : item?.matchName || item?.gameName || '-',
        selectionName: item?.selectionName ? item?.selectionName : item?.betInfo?.runnerName || '-',
        marketType: item?.marketName || item?.marketType || item?.categoryName || '-',
        createdAt: item?.createdAt,
        updatedAt: item?.updatedAt,
        selectionId: item?.selectionId || '-',
        sportName: item?.sportName || sportName || '',
        size: item?.size || '',
        mrktType: item?.mrktType || '',
        matchedTime: item.matchedTime || item?.updatedAt || ''
      };
      respData.push(itemData);
    }),

      resData.results = respData
    return resData;
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

  const filter: any = {
    username: { $in: usernames },
    exEventId: eventId,
    IsUnsettle: 1
  }
  options.sortBy = '_id:desc';
  let betData: any = await CricketBetPlace.paginate(filter, options);
  if (betData?.results?.length === 0) {
    betData = await TennisBetPlace.paginate(filter, options);
  }
  if (betData?.results?.length === 0) {
    betData = await SoccerBetPlace.paginate(filter, options);
  }
  let results: any = []
  if (betData.results.length > 0) {
    betData.results.map((item: any) => {
      const news: any = {};
      news.pl = item.pl > 0 ? parseFloat(item.pl.toString()) : 0,
        news.odds = item.odds > 0 ? parseFloat(item.odds.toString()) : 0,
        news.username = item.username
      news.exEventId = item.exEventId
      news.exMarketId = item.exMarketId
      news.stake = item.stake
      news.selectionId = item.selectionId
      news.type = item.type
      news.size = item.size
      news.eventName = item.eventName
      news.selectionName = item.selectionName
      news.marketType = item.marketType
      news.mrktType = item.mrktType
      news.sportId = item.sportId
      news.sportName = item.sportName
      news.IsSettle = item.IsSettle
      news.IsVoid = item.IsVoid
      news.IsUnsettle = item.IsUnsettle
      news.createdAt = item.createdAt
      news.updatedAt = item.updatedAt
      news.matchedTime = item.matchedTime
      results.push(news)
    });
  }
  // console.log("results",results);
  betData.results = results;
  return betData;
}

const betPL = async (data: any, eventId: string): Promise<void> => {
  const users = await User.find({
    roles: { $in: ['User'] },
    parentId: { $in: [data._id] }
  }).select('username');
  const usernames = users.map(user => user.username);
  const filter = {
    exEventId: eventId,
    username: { $in: usernames }
  }
  let result: any = await CricketPL.find(filter);
  if (result.length === 0) {
    result = await SoccerPL.find(filter);
  }
  if (result.length === 0) {
    result = await TennisPL.find(filter);
  }
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
            if (existingSelection[i][key] || existingSelection[i][key] == 0) {
              existingSelection[i][key] = (existingSelection[i][key] || 0) + (selectionId[i][key] || 0);
            }
          }
        }
      }
    });
    
    marketIdMap.forEach((selectionId, exMarketId) => {
      const index = result.findIndex((entry: any) => entry.exMarketId === exMarketId);
      const updatedItem = {
        _id: result[index]?._id,
        username: result[index]?.username,
        exEventId: result[index]?.exEventId,
        type: result[index]?.type,
        exMarketId,
        selectionId
      };
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

const getLatestBet = async (data: any, eventId: string,sportId: any,flag: string): Promise<void> => {
  const users = await User.find({ roles: { $in: ['User'] }, parentId: { $in: [data._id] } }).select('username');
  const usernames = users.map(user => user.username);
  const filter: any = {
    username: { $in: usernames },
    exEventId: eventId,
    IsUnsettle: 1,
  }
  //sportId = cricket = 4 , soccer =1 , tennis =2
  //fancy => 'fancy', 'line_market' && other =>$nin: ['fancy', 'line_market']
  switch (flag) {
    case "fancy":
        filter.marketType = {$in:['fancy', 'line_market']};
      break;
    default:
      filter.marketType = {$nin:['fancy', 'line_market']};
  }
  let fancyData: any = [];
  
  switch (sportId) {
    case "1":
      fancyData = await SoccerBetPlace.find(filter).sort({ _id: 'desc' }).limit(20);
      break;
    case "2":
      fancyData = await TennisBetPlace.find(filter).sort({ _id: 'desc' }).limit(20);
      break;
    case "4":
      console.log(filter);
      fancyData = await CricketBetPlace.find(filter).sort({ _id: 'desc' }).limit(20);
      break;
  }
  
  let results: any = [];
  if (fancyData.length > 0) {
    fancyData.map((item: any) => {
      const news: any = {};
      news.pl = item.pl > 0 ? parseFloat(item.pl.toString()) : 0,
      news.odds = item.odds > 0 ? parseFloat(item.odds.toString()) : 0,
      news.username = item.username
      news.exEventId = item.exEventId
      news.exMarketId = item.exMarketId
      news.stake = item.stake
      news.selectionId = item.selectionId
      news.type = item.type
      news.size = item.size
      news.eventName = item.eventName
      news.selectionName = item.selectionName
      news.marketType = item.marketType
      news.sportId = item.sportId
      news.sportName = item.sportName
      news.mrktType = item?.mrktType
      news.IsSettle = item.IsSettle
      news.IsVoid = item.IsVoid
      news.IsUnsettle = item.IsUnsettle
      news.createdAt = item.createdAt
      news.updatedAt = item.updatedAt
      news.matchedTime = item.matchedTime
      results.push(news)
    });
  }
  results = results.sort((a: any, b: any) => {
    // Use Date.parse to ensure consistent date comparison
    return Date.parse(b.createdAt) - Date.parse(a.createdAt);
  });
  const resp: any = { results }
  return resp;
}

const marketPL = async (data: any, marketId: string, options: any): Promise<void> => {
  const users = await User.find({ roles: { $in: ['User'] }, parentId: { $in: [data._id] } }).select('username');
  const usernames = users.map(user => user.username);
  await client.connect();
  let markets: any = await client.db(process.env.EXCH_DB).collection('marketRates').findOne({ 'exMarketId': marketId });

  const filter: any = {
    username: { $in: usernames },
    exMarketId: marketId,
    IsUnsettle: 1
  }
  options.sortBy = '_id:desc';
  options.path = { path: "username", model: "User", select: "username", foreignField: 'username', localField: 'username' };
  let betData: any = await CricketPL.paginate(filter, options);
  if (betData?.results?.length === 0) {
    betData = await TennisPL.paginate(filter, options);
  }
  if (betData?.results?.length === 0) {
    betData = await SoccerPL.paginate(filter, options);
  }
  let results: any = []
  if (betData.results.length > 0) {
    betData.results.map((item: any) => {
      const news: any = {};
      news.username = item.username
      news.exEventId = item.exEventId
      news.exMarketId = item.exMarketId
      news.selectionId = item.selectionId
      news.IsSettle = item.IsSettle
      news.IsVoid = item.IsVoid
      news.IsUnsettle = item.IsUnsettle
      news._id = item._id,
        results.push(news)
    });
  }
  // console.log("results",results);
  betData.results = results;
  const resp: any = {
    data: betData,
    eventName: markets?.eventName,
    marketName: markets?.marketName,
    runnerData: markets?.runnerData
  }
  return resp;
}

const marketPLNew = async (data: any, marketId: string, options: any, userId: string): Promise<void> => {
  let parentId: string = data._id;
  let downline: any = [data._id];
  if (userId && userId != '') {
    parentId = userId
  }
  const { limit = 10, page = 1 } = options;
  const skip = (page - 1) * limit;

  const myusers = await User.find({
    $expr: {
      $eq: [
        parentId.toString(),
        {
          $arrayElemAt: ['$parentId', -1]
        }
      ]
    }
  }).skip(skip).limit(parseInt(limit)).select('username roles');

  const totalRecords = await User.find({
    $expr: {
      $eq: [
        parentId.toString(),
        {
          $arrayElemAt: ['$parentId', -1]
        }
      ]
    }
  });


  downline = myusers.filter(user => user.roles.indexOf('User') === -1).map(user => user._id.toString());

  const userss = myusers.filter(user => user.roles.indexOf('User') === 1).map(user => user.username);

  const users = await User.find({ roles: { $in: ['User'] }, parentId: { $in: downline } }).select('username');
  let usernames = users.map(user => user.username);
  usernames = usernames.concat(userss)
  await client.connect();
  let markets: any = await client.db(process.env.EXCH_DB).collection('marketRates').findOne({ 'exMarketId': marketId });

  const filter: any = {
    username: { $in: usernames },
    exMarketId: marketId,
    IsUnsettle: 1
  }

  const populate = { path: "username", model: "User", select: "username roles parentId", foreignField: 'username', localField: 'username' };
  let betData: any = await CricketPL.find(filter).populate(populate).sort({ _id: -1 });
  if (betData?.length === 0) {
    betData = await TennisPL.find(filter).populate(populate).sort({ _id: -1 });
  }
  if (betData?.length === 0) {
    betData = await SoccerPL.find(filter).populate(populate).sort({ _id: -1 });
  }
  let results: any = []
  if (betData.length > 0) {
    results = myusers.map((user: any) => {
      const filteredUsers = betData.filter((user: any) => user.username.parentId.includes(user._id.toString()));
      const typeSums: any = {};
      filteredUsers.map((user: any) => {
        user.selectionId.forEach((entry: any) => {
          for (const key in entry) {
            const value = entry[key];
            if (typeSums[key]) {
              typeSums[key] += value;
            } else {
              typeSums[key] = value;
            }
          }
        });
      });

      return {
        username: {
          username: user.username,
          _id: user._id
        },
        exEventId: markets?.exEventId,
        exMarketId: markets?.exMarketId,
        selectionId: typeSums,
        IsSettle: 0,
        IsVoid: 0,
        IsUnsettle: 1,
      };
    });

    userss.map((user: any) => {
      const filteredUsers = betData.filter((user: any) => user.username.username === user);
      filteredUsers.map((item: any) => {
        const news: any = {};
        news.username = item.username
        news.exEventId = item.exEventId
        news.exMarketId = item.exMarketId
        news.selectionId = item.selectionId
        news.IsSettle = item.IsSettle
        news.IsVoid = item.IsVoid
        news.IsUnsettle = item.IsUnsettle
        news._id = item._id,
          results.push(news)
      });
    });
  }
  const resp: any = {
    data: {
      page,
      limit,
      totalPages: Math.ceil(totalRecords.length / limit),
      totalResults: totalRecords.length,
      results,
    },
    eventName: markets?.eventName,
    marketName: markets?.marketName,
    runnerData: markets?.runnerData
  }
  return resp;
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
  betLockLog,
  getLatestBet,
  marketPL,
  marketPLNew
}