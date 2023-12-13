import { AuraCSPlaceBet, AuraCSResult, Avplacebet, St8Transaction, Reporting, User } from "@/models"
import ApiError from "@/utils/ApiError";
import httpStatus from "http-status";
import * as userService from "@/modules/user/user.service";
import { getFilterProfitLoss } from "../pl/pl.service";

const fetchSportTotalPL = async (data: any, filter: any): Promise<void> => {
  try {

    const userData = await userService.getAllUsersDownlineUser(data?._id);
    const usernames = userData.map((item: any) => item?.username)
    const dateData = getFilterProfitLoss(filter);
    if (dateData.error === 1) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "Please select only 30 days range only.",
      });
    }
    if (dateData.filteredData) {
      const filterData = dateData.filteredData;
      filter = { ...filter, ...filterData };
      delete filter.to
      delete filter.from
      delete filter.timeZone
    }

    filter.username = { $in: usernames }
    const response = await Reporting.aggregate([
      {
        $match: filter
      },
      {
        $group: {
          _id: "$sportId",
          name: { $first: "$sportName" },
          sportId: { $first: "$sportId" },
          pl: { $sum: "$pl" },
          commission: { $sum: "$commission" },
          stack: { $sum: "$stake" }
        }
      }
    ]);

    return response;

  } catch (error: any) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg || "invalid user id.",
    });
  }
}

const fetchCasinoTotalPL = async (data: any, filter: any): Promise<void> => {
  try {
    const userData = await userService.getAllUsersDownlineUser(data?._id);
    const userIds = userData.map((item: any) => item?._id.toString())
    const dateData = getFilterProfitLoss(filter);
    if (dateData.error === 1) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "Please select only 30 days range only.",
      });
    }
    if (dateData.filteredData) {
      const filterData = dateData.filteredData;
      filter = { ...filter, ...filterData };
      delete filter.to
      delete filter.from
      delete filter.timeZone
    }
    filter.userId = { $in: userIds }
    filter.IsSettle = 1
    let resp = await AuraCSPlaceBet.aggregate([
      {
        $match: filter
      },

      {
        $group: {
          _id: null,
          pl: { $sum: "$winnerpl" },
          stack: { $sum: "$betInfo.reqStake" },
        }
      }
    ]);
    let datas = resp[0];
    datas = { ...datas, pl: datas?.pl ? datas?.pl : 0, stack: datas?.stack ? datas?.stack : 0, name: 'Casino', id: '10' }
    resp[0] = datas
    return resp;

  } catch (error: any) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg || "invalid user id.",
    });
  }
}

const fetchIntCasinoTotalPL = async (data: any, filter: any): Promise<void> => {
  try {
    const userData = await userService.getAllUsersDownlineUser(data?._id);
    const usernames = userData.map((item: any) => item?.username)
    const dateData = getFilterProfitLoss(filter);
    if (dateData.error === 1) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "Please select only 30 days range only.",
      });
    }
    if (dateData.filteredData) {
      const filterData = dateData.filteredData;
      filter = { ...filter, ...filterData };
      delete filter.to
      delete filter.from
      delete filter.timeZone
    }
    filter.username = { $in: usernames }
    filter.IsSettle = 1
    let resp = await St8Transaction.aggregate([
      {
        $match: filter
      },

      {
        $group: {
          _id: null,
          pl: { $sum: "$pl" },
          stack: { $sum: "$amount" },
        }
      },
    ]);

    let datas = resp[0];
    datas = { ...datas, pl: datas?.pl ? datas?.pl : 0, stack: datas?.stack ? datas?.stack : 0, name: 'Int Casino', id: '12' }
    resp[0] = datas
    return resp;

  } catch (error: any) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg || "invalid user id.",
    });
  }
}

const fetchAviatorTotalPL = async (data: any, filter: any): Promise<void> => {
  try {
    const userData = await userService.getAllUsersDownlineUser(data?._id);
    const usernames = userData.map((item: any) => item?.username)
    const dateData = getFilterProfitLoss(filter);
    if (dateData.error === 1) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "Please select only 30 days range only.",
      });
    }
    if (dateData.filteredData) {
      const filterData = dateData.filteredData;
      filter = { ...filter, ...filterData };
      delete filter.to
      delete filter.from
      delete filter.timeZone
    }
    filter.user = { $in: usernames }
    filter.issettled = 1
    const resp = await Avplacebet.aggregate([
      {
        $match: filter
      },

      {
        $group: {
          _id: null,
          id: { $first: "$sportId" },
          name: { $first: "$sportName" },
          stack: { $sum: "$stack" },
          pl: { $sum: "$pl" },
          // commission: 0
        }
      }
    ]);
    return resp;

  } catch (error: any) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg || "invalid user id.",
    });
  }
}

const fetchSportEventList = async (data: any, filter: any, options: any): Promise<void> => {
  try {
    const userData = await userService.getAllUsersDownlineUser(data?._id);
    const usernames = userData.map((item: any) => item?.username)
    filter.username = { $in: usernames }
    const dateData = getFilterProfitLoss(filter);
    if (dateData.error === 1) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "Please select only 30 days range only.",
      });
    }

    if (dateData.filteredData) {
      const filterData = dateData.filteredData;
      filter = { ...filter, ...filterData };
      delete filter.to
      delete filter.from
      delete filter.timeZone
    }

    const pipeline: any[] = [
      {
        $match: filter
      }
    ];

    if (filter.exMarketId) {
      pipeline.push({
        $group: {
          _id: "$exMarketId",
          eventName: { $first: "$eventName" },
          sportName: { $first: "$sportName" },
          marketName: { $first: "$marketName" },
          exEventId: { $first: "$exEventId" },
          exMarketId: { $first: "$exMarketId" },
          pl: { $sum: "$pl" },
          stack: { $sum: "$stack" },
          commission: { $sum: "$commission" }
        }
      });
    } else if (filter.exEventId) {
      pipeline.push({
        $group: {
          _id: "$exMarketId",
          eventName: { $first: "$eventName" },
          sportName: { $first: "$sportName" },
          marketName: { $first: "$marketName" },
          exEventId: { $first: "$exEventId" },
          exMarketId: { $first: "$exMarketId" },
          pl: { $sum: "$pl" },
          stack: { $sum: "$stack" },
          commission: { $sum: "$commission" }
        }
      });
    }
    else if (filter.sportName) {
      pipeline.push({
        $group: {
          _id: "$exEventId",
          eventName: { $first: "$eventName" },
          sportName: { $first: "$sportName" },
          marketName: { $first: "$marketName" },
          exEventId: { $first: "$exEventId" },
          exMarketId: { $first: "$exMarketId" },
          pl: { $sum: "$pl" },
          stack: { $sum: "$stack" },
          commission: { $sum: "$commission" }
        }
      });
    }
    else {
      pipeline.push({
        $group: {
          _id: "$sportName",
          eventName: { $first: "$eventName" },
          sportName: { $first: "$sportName" },
          marketName: { $first: "$marketName" },
          exEventId: { $first: "$exEventId" },
          exMarketId: { $first: "$exMarketId" },
          pl: { $sum: "$pl" },
          stack: { $sum: "$stack" },
          commission: { $sum: "$commission" }
        }
      });
    }

    const totalResults = await Reporting.aggregate(pipeline);
    const { limit = 10, page = 1 } = options;
    const skip = (page - 1) * limit;
    pipeline.push({ $skip: skip }, { $limit: parseInt(limit) }, { $sort: { _id: -1 } })

    const results = await Reporting.aggregate(pipeline);
    // totalResults = await totalResults.toArray();

    const result: any = {
      page,
      limit,
      totalPages: Math.ceil(totalResults.length / limit),
      totalResults: totalResults.length,
      results
    };
    return result;

  } catch (error: any) {
    console.log("error", error);

    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg || "invalid user id.",
    });
  }
}

const fetchAviatorList = async (data: any, filter: any, options: any): Promise<void> => {
  try {

    const dateData = getFilterProfitLoss(filter);
    if (dateData.error === 1) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "Please select only 30 days range only.",
      });
    }
    if (dateData.filteredData) {
      const filterData = dateData.filteredData;
      filter = { ...filter, ...filterData };
      delete filter.to
      delete filter.from
      delete filter.timeZone
    }
    const userData = await userService.getAllUsersDownlineUser(data?._id);
    const usernames = userData.map((item: any) => item?.username)
    filter.user = { $in: usernames }
    filter.issettled = 1
    options.sortBy = "_id:desc"
    const resp = await Avplacebet.paginate(filter, options);
    return resp;

  } catch (error: any) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg || "invalid user id.",
    });
  }
}

const fetchIntCasinoList = async (data: any, filter: any, options: any): Promise<void> => {
  try {

    const dateData = getFilterProfitLoss(filter);
    if (dateData.error === 1) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "Please select only 30 days range only.",
      });
    }
    if (dateData.filteredData) {
      const filterData = dateData.filteredData;
      filter = { ...filter, ...filterData };
      delete filter.to
      delete filter.from
      delete filter.timeZone
    }
    const userData = await userService.getAllUsersDownlineUser(data?._id);
    const usernames = userData.map((item: any) => item?.username)
    filter.username = { $in: usernames }
    filter.IsSettle = 1

    if (filter.developerCode) {
      filter.developer_code = filter.developerCode
      delete filter.developerCode;
    }
    const pipeline: any[] = [
      {
        $match: filter
      }
    ];
    if (filter.developer_code) {
      pipeline.push({
        $group: {
          _id: "$game_code",
          developer_code: { $first: "$developer_code" },
          game_code: { $first: "$game_code" },
          gameName: { $first: "$gameName" },
          categoryName: { $first: "$categoryName" },
          pl: { $sum: "$pl" },
          stack: { $sum: "$amount" },
        }
      });
    }
    else {
      pipeline.push({
        $group: {
          _id: "$developer_code",
          developer_code: { $first: "$developer_code" },
          game_code: { $first: "$game_code" },
          gameName: { $first: "$gameName" },
          categoryName: { $first: "$categoryName" },
          pl: { $sum: "$pl" },
          stack: { $sum: "$amount" },
        }
      });
    }

    const totalResults = await St8Transaction.aggregate(pipeline);
    const { limit = 10, page = 1 } = options;
    const skip = (page - 1) * limit;
    pipeline.push({ $skip: skip }, { $limit: parseInt(limit) }, { $sort: { _id: -1 } })
    const results = await St8Transaction.aggregate(pipeline);

    const result: any = {
      page,
      limit,
      totalPages: Math.ceil(totalResults.length / limit),
      totalResults: totalResults.length,
      results
    };
    return result;

  } catch (error: any) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg || "invalid user id.",
    });
  }
}

const fetchuserPLList = async (data: any, filter: any, options: any): Promise<void> => {
  try {
    const dateData = getFilterProfitLoss(filter);
    let parentId = data._id.toString();
    if (dateData.error === 1) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "Please select only 30 days range only.",
      });
    }
    if (dateData.filteredData) {
      const filterData = dateData.filteredData;
      filter = { ...filter, ...filterData };
      delete filter.to
      delete filter.from
      delete filter.timeZone
    }
    const userFliter: any = {}
    if (filter.search) {
      const regexSearch = new RegExp(filter.search, 'i');
      userFliter.username = regexSearch
    }
    if (filter.userId) {
      parentId = filter.userId;
      delete filter.userId;
    }
    const query: any = {
      $and: [
        {
          $expr: {
            $eq: [
              parentId,
              {
                $arrayElemAt: ['$parentId', -1]
              }
            ]
          },
        },
        userFliter
      ]
    }

    const { limit = 10, page = 1 } = options;
    const skip = (page - 1) * limit;
    const userData: any = await User.find(query).skip(skip).limit(limit).sort({ _id: 1 })
    const totalResults: any = await User.find(query).countDocuments().lean();
    let parents: any = [];
    let userIds: any = [];
    let usernames: any = [];
    userData.map((item: any) => {
      if (item?.roles.includes('User')) {
        usernames.push(item?.username)
        userIds.push(item?._id.toString())
      } else {
        parents.push(item?._id.toString())
      }
    });
    const parentUsers: any = await User.find({ parentId: { $in: parents }, roles: { $in: ['User'] } }).select('username parentId roles');

    parentUsers.map((item: any) => {
      usernames.push(item?.username)
      userIds.push(item?._id.toString())
    });
    filter.username = { $in: usernames }
    // filter.IsSettle = 1
    let results: any = [];
    results = await Reporting.aggregate([
      {
        $match: filter
      },
      {
        $group: {
          _id: "$username",
          name: { $first: "$sportName" },
          sportId: { $first: "$sportId" },
          pl: { $sum: "$pl" },
          stake: { $sum: "$stake" },
          commission: { $sum: "$commission" }
        }
      }
    ]);

    //st8
    const st8Data = await St8Transaction.aggregate([
      {
        $match: filter
      },
      {
        $group: {
          _id: "$username",
          developer_code: { $first: "$developer_code" },
          username: { $first: "$username" },
          game_code: { $first: "$game_code" },
          gameName: { $first: "$gameName" },
          categoryName: { $first: "$categoryName" },
          pl: { $sum: "$pl" },
          stack: { $sum: "$amount" },
        }
      }
    ]);

    //casino 
    delete filter.username
    filter.userId = { $in: userIds }
    filter.IsSettle = 1
    const casinoData = await AuraCSPlaceBet.aggregate([
      {
        $match: filter
      },

      {
        $group: {
          _id: "$userId",
          userId: { $first: '$userId' },
          pl: { $sum: "$winnerpl" },
          stack: { $sum: "$betInfo.reqStake" },
        }
      },
      {
        $lookup: {
          from: 'users',
          let: { auraUserId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [{ $toString: "$_id" }, "$$auraUserId"]
                }
              }
            },
            {
              $project: {
                username: 1
              }
            }
          ],
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          _id: 1,
          pl: 1,
          stack: 1,
          username: '$user.username'
        }
      }
    ]);

    //Aviator
    delete filter.userId;
    delete filter.IsSettle;
    filter.user = { $in: usernames }
    filter.issettled = 1
    const aviatorData = await Avplacebet.aggregate([
      {
        $match: filter
      },
      {
        $group: {
          _id: '$user',
          id: { $first: "$sportId" },
          username: { $first: "$user" },
          name: { $first: "$sportName" },
          pl: { $sum: "$pl" },
          stack: { $sum: "$stack" },
          // commission: 0
        }
      }
    ]);

    results = results.concat(st8Data, casinoData, aviatorData)

    const parentWiseUsers = userData.map((parent: any) => {
      return {
        parent,
        users: parentUsers.filter((user: any) => user.parentId.includes(parent._id)),
      };
    });

    const parentSumArr = parentWiseUsers.map((parentData: any) => {
      const { parent, users } = parentData;
      let sum = { pl: 0, stack: 0, commission: 0 }
      if (users.length > 0) {
        sum = users.reduce((acc: any, user: any) => {
          const userResult = results.find((result: any) => result.username === user.username || result.userId === user._id);
          if (userResult) {
            acc.pl += userResult.pl || 0;
            acc.stack += userResult.stack || 0;
            acc.commission += userResult.commission || 0;
          }
          return acc;
        }, { pl: 0, stack: 0, commission: 0 });
      } else {
        const userResult = results.find((result: any) => result.username === parent.username);
        if (userResult) {
          sum.pl = userResult.pl || 0;
          sum.stack = userResult.stack || 0;
          sum.commission = userResult.commission || 0;
        }
      }

      return {
        _id: parent._id,
        username: parent.username,
        roles: parent.roles,
        pl: sum.pl,
        stack: sum.stack,
        commission: sum.commission,
      };
    });

    const result: any = {
      page,
      limit,
      totalPages: Math.ceil(totalResults / limit),
      totalResults: totalResults,
      results: parentSumArr
    };
    return result;

  } catch (error: any) {
    console.log("error", error);

    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg || "invalid user id.",
    });
  }
}
const userEventsProfitlossAura = async (data: any, filter: any, options: any): Promise<void> => {
  try {
    const dateData = getFilterProfitLoss(filter);
    if (dateData.error === 1) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "Please select only 30 days range only.",
      });
    }
    if (dateData.filteredData) {
      const filterData = dateData.filteredData;
      filter = { ...filter, ...filterData };
      delete filter.to
      delete filter.from
      delete filter.timeZone
    }
    const userData = await userService.getAllUsersDownlineUser(data?._id);
    const userIds = userData.map((item: any) => item?._id.toString())
    filter.userId = { $in: userIds }
    filter.IsSettle = 1
    const { limit = 10, page = 1 } = options;
    const skip = (page - 1) * limit;
    const retData: any = [];
    const result = await AuraCSPlaceBet.aggregate([
      {
        $match: filter,
      },
      {
        $group: {
          _id: {
            matchName: '$matchName',
          },
          eventId: { $first: '$_id' },
          pl: {
            $sum: '$winnerpl',
          },
          stack: {$sum: '$betInfo.reqStake'}
        },
      },
      {
        $sort: { "pl": -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: parseInt(limit, 10),
      },
    ]);

    const totalResults = await AuraCSPlaceBet.aggregate([
      {
        $match: filter,
      },
      {
        $group: {
          _id: {
            matchName: '$matchName',
          },
          eventId: { $first: '$_id' },
          pl: {
            $sum: '$winnerpl',
          },
        },
      },
    ]);
    result.map((data: any) => {
      const mapdata = {
        sportName: 'Casino',
        matchName: data._id.matchName,
        eventId: data.eventId,
        pl: data.pl,
        stack: data.stack,
      };
      retData.push(mapdata);
    });
    const resData: any = {
      page,
      limit,
      totalPages: Math.ceil(totalResults.length / limit),
      totalResults: totalResults.length,
      results: retData,
    };
    return resData;
  } catch (error: any) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg || "invalid user id.",
    });
  }
}

const userMarketsProfitlossAura = async (data: any, filter: any, options: any): Promise<void> => {
  try {
    const dateData = getFilterProfitLoss(filter);
    if (dateData.error === 1) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "Please select only 30 days range only.",
      });
    }
    if (dateData.filteredData) {
      const filterData = dateData.filteredData;
      filter = { ...filter, ...filterData };
      delete filter.to
      delete filter.from
      delete filter.timeZone
    }
    const userData = await userService.getAllUsersDownlineUser(data?._id);
    const userIds = userData.map((item: any) => item?._id.toString())
    filter.userId = { $in: userIds }
    filter.IsSettle = 1;
    const { limit = 10, page = 1 } = options;
    const skip = (page - 1) * limit;
    const result = await AuraCSPlaceBet.aggregate([
      {
        $match: filter,
      },
      {
        $group: {
          _id: {
            marketName: '$marketName',
          },
          eventId: { $first: '$_id' },
          pl: {
            $sum: '$winnerpl',
          },
          stack: {$sum: '$betInfo.reqStake'}

        },
      },
      {
        $sort: { "pl": -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: parseInt(limit, 10),
      },
    ]);

    const totalResults = await AuraCSPlaceBet.aggregate([
      {
        $match: filter,
      },
      {
        $group: {
          _id: {
            marketName: '$marketName',
          },
          eventId: { $first: '$_id' },
          pl: {
            $sum: '$winnerpl',
          },
        },
      },
    ]);
    const retData: any = [];
    result.map((data: any) => {
      const mapdata = {
        sportName: 'Casino',
        eventName: data._id.marketName,
        eventId: data.eventId,
        pl: data.pl,
        stack: data.stack,
      };
      retData.push(mapdata);
    });
    const resData: any = {
      page,
      limit,
      totalPages: Math.ceil(totalResults.length / limit),
      totalResults: totalResults.length,
      results: retData,
    };
    return resData;
  } catch (error: any) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg || "invalid user id.",
    });
  }
}


export { fetchSportTotalPL, fetchCasinoTotalPL, fetchIntCasinoTotalPL, fetchAviatorTotalPL, fetchSportEventList, fetchAviatorList, fetchIntCasinoList, fetchuserPLList, userEventsProfitlossAura, userMarketsProfitlossAura }
