import ApiError from "@/utils/ApiError";
import httpStatus from "http-status";
import { MongoClient } from 'mongodb';
import configs from "@/config/config";
import { AuraCSPlaceBet, AuraCSResult, Avplacebet, CricketBetPlace, Reporting, St8Transaction } from "@/models";
const client = new MongoClient(configs.mongoose.url);
import moment from 'moment-timezone';
import { findUserById } from "../user/user.service";
import { ObjectId } from 'mongodb';

const getFilterProfitLoss = (filter: any) => {
  const filteredData: any = {};
  let error: number = 0;
  if ((filter?.from && filter?.from !== '') && (filter?.to && filter?.to !== '')) {
    const timeZone = filter.timeZone || 'Asia/Calcutta';
    const startDate = moment.tz(filter?.from, timeZone);
    const endDate = moment.tz(filter?.to, timeZone);

    const date1 = startDate.clone().startOf('day');
    const date2 = endDate.clone().endOf('day');
    const timeDifferenceMs = date2.diff(date1, 'days');
    if (timeDifferenceMs > 30) {
      error = 1;
    }
    filteredData.createdAt = {
      $gte: date1.toDate(),
      $lt: date2.toDate(),
    };
  }
  return { filteredData, error };
};

const userSportsProfitloss = async (filters: any): Promise<void> => {
  try {
    const profile: any = await findUserById(filters.userId)
    if (!profile) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "User id is incorrect.",
      });
    }
    const retresult: any = [];
    const dateData = getFilterProfitLoss(filters);
    if (dateData.error === 1) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "Please select only 30 days range only.",
      });
    }
    let filter = { username: profile.username };

    if (dateData.filteredData) {
      const filterData = dateData.filteredData;
      filter = { ...filter, ...filterData };
    }
    let results: any = await client.db(process.env.EXCH_DB).collection('reportings')
      .aggregate([
        {
          $match: filter,
        },
        {
          $group: {
            _id: {
              sportId: '$sportId',
              sportName: '$sportName',
            },
            pl: {
              $sum: '$pl',
            },
            commission: {
              $sum: '$commission',
            },
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
      ]);
    results = await results.toArray();
    results.map((result: any) => {
      const data: any = {};
      data.pl = result.pl;
      data.commission = result.commission;
      data.sportId = result._id.sportId;
      data.sportName = result._id.sportName;
      retresult.push(data);
    });
    return retresult;
  } catch (error: any) {
    console.log("error", error);
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg || "something want wrong.",
    });
  }
}

const userEventsProfitloss = async (filters: any, options: any): Promise<void> => {
  try {
    const profile: any = await findUserById(filters.userId)
    if (!profile) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "User id is incorrect.",
      });
    }

    const dateData = getFilterProfitLoss(filters);
    if (dateData.error === 1) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "Please select only 30 days range only.",
      });
    }
    let filter = { username: profile.username, sportId: filters.sportId };
    if (dateData.filteredData) {
      const filterData = dateData.filteredData;
      filter = { ...filter, ...filterData };
    }
    const { limit = 10, page = 1 } = options;
    const skip = (page - 1) * limit;
    const retresult: any = [];

    let results: any = await client.db(process.env.EXCH_DB).collection('reportings')
      .aggregate([
        {
          $match: filter,
        },
        {
          $group: {
            _id: {
              eventName: '$eventName',
              sportName: '$sportName',
              eventId: '$exEventId',
            },
            pl: {
              $sum: '$pl',
            },
            commission: {
              $sum: '$commission',
            },
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: parseInt(limit),
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
      ]);
    results = await results.toArray();
    let totalResults: any = await client.db(process.env.EXCH_DB).collection('reportings')
      .aggregate([
        {
          $match: filter,
        },
        {
          $group: {
            _id: {
              eventName: '$eventName',
              sportName: '$sportName',
              eventId: '$exEventId',
            },
            pl: {
              $sum: '$pl',
            },
          },
        },
      ]);
    totalResults = await totalResults.toArray();

    results.map((result: any) => {
      const data: any = {};
      data.pl = result.pl;
      data.commission = result.commission;
      data.eventId = result._id.eventId;
      data.eventName = result._id.eventName;
      data.sportName = result._id.sportName;
      retresult.push(data);
    });
    const resData: any = {
      page,
      limit,
      totalPages: Math.ceil(totalResults.length / limit),
      totalResults: totalResults.length,
      results: retresult,
    };
    return resData;
  } catch (error: any) {
    console.log("error", error);
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg || "something want wrong.",
    });
  }
}

const userMarketsProfitloss = async (filters: any, options: any): Promise<void> => {
  try {
    const profile: any = await findUserById(filters.userId)
    if (!profile) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "User id is incorrect.",
      });
    }

    const dateData = getFilterProfitLoss(filters);
    if (dateData.error === 1) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "Please select only 30 days range only.",
      });
    }
    let filter = { username: profile.username, exEventId: filters.eventId };
    if (dateData.filteredData) {
      const filterData = dateData.filteredData;
      filter = { ...filter, ...filterData };
    }
    const resData: any = await Reporting.paginate(filter, options);
    let retdata: any = []
    if (resData.results.length > 0) {
      retdata = resData.results.map((result: any) => {
        delete result._id;
        delete result.username;
        return result;
      });
    }
    resData.results = retdata;
    return resData;
  } catch (error: any) {
    console.log("error", error);
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg || "something want wrong.",
    });
  }
}

const getUserBetList = async (filters: any, options: any): Promise<void> => {
  try {
    const profile: any = await findUserById(filters.userId)
    if (!profile) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "User id is incorrect.",
      });
    }

    const dateData = getFilterProfitLoss(filters);
    if (dateData.error === 1) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "Please select only 30 days range only.",
      });
    }
    let filter = { username: profile.username, sportId: filters.sportId, exMarketId: filters.marketId };
    if (dateData.filteredData) {
      const filterData = dateData.filteredData;
      filter = { ...filter, ...filterData };
    }

    const resData: any = await CricketBetPlace.paginate(filter, options);
    let retdata: any = []
    if (resData.results.length > 0) {
      resData.results.map((data: any) => {
        const result = {
          pl1: Number(data.pl),
          pl2: Number(-data.stake),
          type: data.type,
          sportName: data.sportName,
          eventName: data.eventName,
          marketName: data.marketType,
          oddsPrice: data.odds,
          selectionName: data.selectionName,
          stake: data.stake,
          matchedTime: data.matchedTime,
          createdAt: data.createdAt,
        };
        if (result.type === 'lay') {
          const temp = result.pl1;
          result.pl1 = result.pl2;
          result.pl2 = temp;
        }
        retdata.push(result);
      });
    }
    resData.results = retdata;
    return resData;
  } catch (error: any) {
    console.log("error", error);
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg || "something want wrong.",
    });
  }
}

const aviatorSumOfPl = async (filters: any): Promise<void> => {
  try {
    const profile: any = await findUserById(filters.userId)
    if (!profile) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "User id is incorrect.",
      });
    }

    const dateData = getFilterProfitLoss(filters);
    if (dateData.error === 1) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "Please select only 30 days range only.",
      });
    }
    let filter = { user: profile.username };
    if (dateData.filteredData) {
      const filterData = dateData.filteredData;
      filter = { ...filter, ...filterData };
    }

    const result = await Avplacebet.aggregate([
      {
        $match: filter,
      },
      {
        $group: {
          _id: profile.username,
          total: {
            $sum: { $subtract: ['$pl', '$stack'] },
          },
        },
      },
    ]);
    let data: any = { total: 0, _id: profile.username };
    if (result.length > 0) {
      data = { ...result[0], total: (result[0]?.total || 0).toFixed(2) };
    }
    return data;
  } catch (error: any) {
    console.log("error", error);
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg || "something want wrong.",
    });
  }
}

const aviatorPl = async (filters: any, options: any): Promise<void> => {
  try {
    const profile: any = await findUserById(filters.userId)
    if (!profile) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "User id is incorrect.",
      });
    }

    const dateData = getFilterProfitLoss(filters);
    if (dateData.error === 1) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "Please select only 30 days range only.",
      });
    }
    let filter = { user: profile.username };
    if (dateData.filteredData) {
      const filterData = dateData.filteredData;
      filter = { ...filter, ...filterData };
    }
    const resData: any = await Avplacebet.paginate(filter, options);
    return resData;
  } catch (error: any) {
    console.log("error", error);
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg || "something want wrong.",
    });
  }
}

const getCategoryTotalPL = async (filters: any): Promise<void> => {
  try {
    const profile: any = await findUserById(filters.userId)
    if (!profile) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "User id is incorrect.",
      });
    }

    const dateData = getFilterProfitLoss(filters);
    if (dateData.error === 1) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "Please select only 30 days range only.",
      });
    }
    let filter = { username: profile.username };
    if (dateData.filteredData) {
      const filterData = dateData.filteredData;
      filter = { ...filter, ...filterData };
    }

    const categories: any = await St8Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$username',
          totalPL: {
            $sum: {
              $cond: [
                { $eq: ['$pl', 0] },
                { $subtract: ['$pl', '$amount'] },
                '$pl',
              ],
            },
          },
          data: { $push: '$$ROOT' },
        },
      },
      {
        $project: {
          _id: 0,
          username: '$_id',
          totalPL: '$totalPL',
          createdAt: { $first: '$data.createdAt' },
          sportName: 'Int Casino',
        },
      },
      { $sort: { updatedAt: -1 } },
    ]);
    let result: any = {};
    if (categories.length > 0) result = categories[0];
    return result;
  } catch (error: any) {
    console.log("error", error);
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg || "something want wrong.",
    });
  }
}

const getCategoryList = async (filters: any, options: any): Promise<void> => {
  try {
    const profile: any = await findUserById(filters.userId)
    if (!profile) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "User id is incorrect.",
      });
    }

    const dateData = getFilterProfitLoss(filters);
    if (dateData.error === 1) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "Please select only 30 days range only.",
      });
    }
    let filter = { username: profile.username };
    if (dateData.filteredData) {
      const filterData = dateData.filteredData;
      filter = { ...filter, ...filterData };
    }

    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const total = await St8Transaction.find(filter).countDocuments().lean();
    const categories = await St8Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$developer_code',
          totalPL: {
            $sum: {
              $cond: {
                if: { $eq: ['$pl', 0] },
                then: { $subtract: ['$pl', '$amount'] },
                else: '$pl',
              },
            },
          },
          data: { $push: '$$ROOT' },
        },
      },
      {
        $project: {
          _id: 0,
          developerCode: '$_id',
          totalPL: '$totalPL',
          createdAt: { $first: '$data.createdAt' },
          categoryName: { $first: '$data.categoryName' },
          sportName: 'Int Casino',
        },
      },
      { $sort: { updatedAt: -1 } },
      {
        $skip: skip,
      },
      {
        $limit: parseInt(limit),
      },
    ]);
    const resData: any = {
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalResults: total,
      results: categories,
    };
    return resData;
  } catch (error: any) {
    console.log("error", error);
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg || "something want wrong.",
    });
  }
}

const getGameList = async (filters: any, options: any): Promise<void> => {
  try {
    const profile: any = await findUserById(filters.userId)
    if (!profile) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "User id is incorrect.",
      });
    }

    const dateData = getFilterProfitLoss(filters);
    if (dateData.error === 1) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "Please select only 30 days range only.",
      });
    }
    let filter = { username: profile.username, developer_code: filters?.category };
    if (dateData.filteredData) {
      const filterData = dateData.filteredData;
      filter = { ...filter, ...filterData };
    }

    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const total = await St8Transaction.find(filter).countDocuments().lean();
    const categories = await St8Transaction.aggregate([
      {
        $match: filter,
      },
      {
        $group: {
          _id: '$game_code',
          totalPL: {
            $sum: {
              $cond: {
                if: { $eq: ['$pl', 0] },
                then: { $subtract: ['$pl', '$amount'] },
                else: '$pl',
              },
            },
          },
          data: { $push: '$$ROOT' },
        },
      },
      {
        $project: {
          _id: 0,
          game_code: '$_id',
          totalPL: '$totalPL',
          createdAt: { $first: '$data.createdAt' },
          categoryName: { $first: '$data.categoryName' },
          gameName: { $first: '$data.gameName' },
          sportName: 'Int Casino',
        },
      },
      { $sort: { updatedAt: -1 } },
      { $skip: skip },
      {
        $limit: parseInt(limit),
      },
    ]);
    const resData: any = {
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalResults: total,
      results: categories,
    };
    return resData;
  } catch (error: any) {
    console.log("error", error);
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg || "something want wrong.",
    });
  }
}

function transform(acc: any, cur: any) {
  const key = `${cur.sportName}_${cur.eventName}`;
  if (acc[key]) {
    acc[key].pl += cur.pl;
  } else {
    acc[key] = {
      sportName: cur.sportName,
      eventName: cur.eventName,
      pl: cur.pl,
    };
  }
  return acc;
}
function transformwithEventId(acc: any, cur: any) {
  const key = `${cur.sportName}_${cur.eventName}`;
  if (acc[key]) {
    acc[key].pl += cur.pl;
  } else {
    acc[key] = {
      sportName: cur.sportName,
      eventId: cur.eventId,
      eventName: cur.eventName,
      pl: cur.pl,
    };
  }
  return acc;
}
const userSportsProfitlossAura = async (filters: any): Promise<void> => {
  try {
    const profile: any = await findUserById(filters.userId)
    if (!profile) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "User id is incorrect.",
      });
    }

    const dateData = getFilterProfitLoss(filters);
    if (dateData.error === 1) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "Please select only 30 days range only.",
      });
    }
    let filter: any = { userId: profile._id.toString() };
    if (dateData.filteredData) {
      const filterData = dateData.filteredData;
      filter = { ...filter, ...filterData };
    }

    const data = await AuraCSPlaceBet.aggregate([
      {
        $match: filter,
      },
       {
        $group: {
          _id: null,
          pl: {
            $sum: '$winnerpl',
          },
        },
      },

    ]);
    if (data.length > 0) {
      data[0].sportId = '10';
      data[0].sportName = 'Casino';
    };

    // let roundIds: any = [];
    // let retdata: any = [];
    // const winnerIds: any = [];
    // if (resData.length > 0) {
    //   retdata = resData.map((result: any) => {
    //     const retres = {
    //       sportName: 'Casino',
    //       roundId: result.betInfo.roundId,
    //       pl: 0,
    //       runners: result.runners,
    //     };
    //     roundIds.push(result.betInfo.roundId);
    //     return retres;
    //   });
    // }
    // roundIds = [...new Set(roundIds)];
    // const winnerData = await AuraCSResult.find({ roundId: { $in: roundIds } });
    // winnerData.map((win: any) => {
    //   const key = win.roundId;
    //   const marketdata = win.market.marketRunner;
    //   let value;
    //   marketdata.map((md: any) => {
    //     if (md.status === 'WINNER') {
    //       value = md.name;
    //     }
    //   });
    //   winnerIds.push({ [key]: value });
    // });
    // console.log("retdata",retdata);
    
    // retdata.map((ret: any) => {
    //   let winner: string;
    //   let pl;
    //   winnerIds.map((el: any) => {
    //     const key = Object.keys(el)[0];
    //     if (key === ret.roundId) {
    //       winner = el[key];
    //     }
    //   });
    //   ret.runners.map((runner: any) => {
    //     if (runner.name === winner) {
    //       pl = runner.pl;
    //     }
    //   });
    //   ret.pl = pl;
    //   delete ret.runners;
    // });
    // console.log("retdatssa",retdata);
    
    // retdata = retdata.filter((value: any, index: number, self: any) => index === self.findIndex((t: any) => (
    //   t.roundId === value.roundId
    // )));
    // console.log("retdatsdddsa",retdata);

    // retdata.map((ret: any) => delete ret.roundId);
    // const result = retdata.reduce(transform, {});
    // console.log("result",result);
    
    // const resultArray: any = Object.values(result);

    // if (resultArray.length > 0) resultArray[0].sportId = '10';
    return data;
  } catch (error: any) {
    console.log("error", error);
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg || "something want wrong.",
    });
  }
}

const userEventsProfitlossAura = async (filters: any, options: any): Promise<void> => {
  try {
    const profile: any = await findUserById(filters.userId)
    if (!profile) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "User id is incorrect.",
      });
    }

    const dateData = getFilterProfitLoss(filters);
    if (dateData.error === 1) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "Please select only 30 days range only.",
      });
    }
    let filter = { userId: profile._id.toString() };
    if (dateData.filteredData) {
      const filterData = dateData.filteredData;
      filter = { ...filter, ...filterData };
    }


    const { limit = 10, page = 1 } = options;
    const skip = (page - 1) * limit;
    const retData:any = [];
    
    const result = await AuraCSPlaceBet.aggregate([
      {
        $match: filter,
      },
      {
        $group: {
          _id: {
            matchName: '$matchName',
          },
          eventId:{$first:'$_id'},
          pl: {
            $sum: '$winnerpl',
          },
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: parseInt(limit, 10),
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);
    const totalResults = await AuraCSPlaceBet.aggregate([
      {
        $match: filter,
      },
      {
        $group: {
          _id: {
            userId: '$userId',
            matchName: '$matchName',
          },
          pl: {
            $sum: '$winnerpl',
          },
        },
      },
    ]);
     result.map((data:any) => {
      const mapdata = {
        sportName: 'Casino',
        eventName: data._id.matchName,
        eventId: data.eventId,
        pl: data.pl,
      };
      retData.push(mapdata);
    });
    const resData:any = {
      page,
      limit,
      totalPages: Math.ceil(totalResults.length / limit),
      totalResults: totalResults.length,
      results: retData,
    };
    return resData;
    // const resData = await AuraCSPlaceBet.paginate(filter, options);
    // let roundIds: any = [];
    // let retdata: any = [];
    // const winnerIds: any = [];
    // if (resData.results.length > 0) {
    //   retdata = resData.results.map((result: any) => {
    //     const retres = {
    //       sportName: 'Casino',
    //       eventName: result.matchName,
    //       eventId: result._id.toString(),
    //       roundId: result.betInfo.roundId,
    //       pl: '',
    //       runners: result.runners,
    //     };
    //     roundIds.push(result.betInfo.roundId);
    //     return retres;
    //   });
    // }
    // roundIds = [...new Set(roundIds)];
    // const winnerData = await AuraCSResult.find({ roundId: { $in: roundIds } });
    // winnerData.map((win: any) => {
    //   const key = win.roundId;
    //   const marketdata = win.market.marketRunner;
    //   let value;
    //   marketdata.map((md: any) => {
    //     if (md.status === 'WINNER') {
    //       value = md.name;
    //     }
    //   });
    //   winnerIds.push({ [key]: value });
    // });
    // retdata.map((ret: any) => {
    //   let winner: string;
    //   let pl;
    //   winnerIds.map((el: any) => {
    //     const key = Object.keys(el)[0];
    //     if (key === ret.roundId) {
    //       winner = el[key];
    //     }
    //   });
    //   ret.runners.map((runner: any) => {
    //     if (runner.name === winner) {
    //       pl = runner.pl;
    //     }
    //   });
    //   ret.pl = pl;
    //   delete ret.runners;
    // });
    // retdata = retdata.filter((value: any, index: any, self: any) => index === self.findIndex((t: any) => (
    //   t.roundId === value.roundId
    // )));
    // retdata.map((ret: any) => delete ret.roundId);
    // const result = retdata.reduce(transformwithEventId, {});
    // const resultArray = Object.values(result);
    // resData.results = resultArray;
    // resData.totalResults = resultArray.length;
    // resData.totalPages = Math.ceil(resultArray.length / resData.limit);
    // return resData;
  } catch (error: any) {
    console.log("error", error);
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg || "something want wrong.",
    });
  }
}

const userMarketsProfitlossAura = async (filters: any, options: any): Promise<void> => {
  try {
    const profile: any = await findUserById(filters.userId)
    if (!profile) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "User id is incorrect.",
      });
    }

    const dateData = getFilterProfitLoss(filters);
    if (dateData.error === 1) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "Please select only 30 days range only.",
      });
    }
    let filter = { userId: profile._id.toString(),matchName: filters.matchName };

    if (dateData.filteredData) {
      const filterData = dateData.filteredData;
      filter = { ...filter, ...filterData };
    }
    const resData = await AuraCSPlaceBet.paginate(filter, options);
    let roundIds: any = [];
    let retdata: any = [];
    const winnerIds: any = [];
    if (resData.results.length > 0) {
      retdata = resData.results.map((result: any) => {
        const retres = {
          eventName: filters.matchName,
          sportId: '10',
          sportName: 'Casino',          
          marketName: result.marketName,
          roundId: result.betInfo.roundId,
          result: '',
          pl: '',
          runners: result.runners,
          createdAt: result.createdAt,
        };
        roundIds.push(result.betInfo.roundId);
        return retres;
      });
    }
    roundIds = [...new Set(roundIds)];
    const winnerData = await AuraCSResult.find({ roundId: { $in: roundIds } });
    winnerData.map((win: any) => {
      const key = win.roundId;
      const marketdata = win.market.marketRunner;
      let value;
      marketdata.map((md: any) => {
        if (md.status === 'WINNER') {
          value = md.name;
        }
      });
      winnerIds.push({ [key]: value });
    });
    retdata.map((ret: any) => {
      let winner: any;
      let pl;
      winnerIds.map((el: any) => {
        const key = Object.keys(el)[0];
        if (key === ret.roundId) {
          winner = el[key];
        }
      });
      ret.runners.map((runner: any) => {
        if (runner.name === winner) {
          pl = runner.pl;
        }
      });
      ret.result = winner;
      ret.pl = pl;
      delete ret.runners;
    });
    retdata = retdata.filter((value: any, index: number, self: any) => index === self.findIndex((t: any) => (
      t.roundId === value.roundId
    )));
    resData.results = retdata;
    resData.totalResults = retdata.length;
    resData.totalPages = Math.ceil(retdata.length / resData.limit);
    return resData;
  } catch (error: any) {
    console.log("error", error);
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg || "something want wrong.",
    });
  }
}

const getUserBetListAura = async (filters: any, options: any): Promise<void> => {
  try {
    const profile: any = await findUserById(filters.userId)
    if (!profile) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "User id is incorrect.",
      });
    }

    const dateData = getFilterProfitLoss(filters);
    if (dateData.error === 1) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "Please select only 30 days range only.",
      });
    }
    let filter = {
      userId: profile._id.toString(), 'betInfo.roundId': filters.roundId,
    };
    if (dateData.filteredData) {
      const filterData = dateData.filteredData;
      filter = { ...filter, ...filterData };
    }

    const resultData = await AuraCSPlaceBet.paginate(filter, options);
    let resultArr: any = [];
    if (resultData.results.length > 0) {
      resultData.results.map((data: any) => {
        const result = {
          pl1: Number(data.betInfo.pnl),
          pl2: Number(-data.betInfo.reqStake),
          type: data.betInfo.isBack ? 'back' : 'lay',
          sportName: 'Casino',
          eventName: data.matchName,
          marketName: data.marketName,
          oddsPrice: data.betInfo.requestedOdds,
          selectionName: data.betInfo.runnerName,
          stake: data.betInfo.reqStake,
          matchedTime: data.createdAt,
          createdAt: data.createdAt,
        };
        if (result.type === 'lay') {
          const temp = result.pl1;
          result.pl1 = result.pl2;
          result.pl2 = temp;
        }
        resultArr.push(result);
      });
    }
    resultData.results = resultArr;
    return resultData;
  } catch (error: any) {
    console.log("error", error);
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg || "something want wrong.",
    });
  }
}

export { userSportsProfitloss, userEventsProfitloss, userMarketsProfitloss, getUserBetList, aviatorSumOfPl, aviatorPl, getCategoryTotalPL, getCategoryList, getGameList, userSportsProfitlossAura, userEventsProfitlossAura, userMarketsProfitlossAura, getUserBetListAura, getFilterProfitLoss }