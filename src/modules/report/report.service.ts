import { AuraCSPlaceBet, Avplacebet, St8Transaction, Reporting, User } from "@/models"
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
          stack: { $sum: "$stack" }
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
    console.log("filter",filter);    
    const resp = await Avplacebet.aggregate([
      {
        $match: filter
      },

      {
        $group: {
          _id: null,
          id: { $first: "$sportId" },
          name: { $first: "$sportName" },
          pl: {
            $sum: { $subtract: ['$pl', '$stack'] },
          },
          stack: { $sum: "$stack" },
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
    filter.IsSettle = 1
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
    if (filter.userName) {
      userFliter.username = filter.userName
    }
    const query: any = {
      $and: [
        {
          $expr: {
            $eq: [
              data?._id.toString(),
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
    const usernames = userData.map((item: any) => item?.username)
    const userIds = userData.map((item: any) => item?._id.toString())

    filter.username = { $in: usernames }
    filter.IsSettle = 1
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
          stack: { $sum: "$stack" },
          commission: { $sum: "$commission" }
        }
      }
    ]);

    //st8
    const st8Data = await Reporting.aggregate([
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
    filter.user = { $in: usernames }
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
    const userMap: any = new Map(results.map((user: any) => [user.username, user]));

    results = usernames.map((username: any) => ({
      pl: 0,
      stack: 0,
      commission: 0,
      username,

      ...(userMap.get(username) || {})
    }));

    const result: any = {
      page,
      limit,
      totalPages: Math.ceil(totalResults / limit),
      totalResults: totalResults,
      results
    };
    return result;

  } catch (error: any) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg || "invalid user id.",
    });
  }
}



export { fetchSportTotalPL, fetchCasinoTotalPL, fetchIntCasinoTotalPL, fetchAviatorTotalPL, fetchSportEventList, fetchAviatorList, fetchIntCasinoList, fetchuserPLList }