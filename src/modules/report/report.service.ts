import { CricketBetPlace, AuraCSPlaceBet, TennisBetPlace, SoccerBetPlace, Avplacebet, St8Transaction, Reporting } from "@/models"
import ApiError from "@/utils/ApiError";
import httpStatus from "http-status";
import * as userService from "@/modules/user/user.service";

const fetchSportTotalPL = async (data: any): Promise<void> => {
  try {

    const userData = await userService.getAllUsersDownlineUser(data?._id);
    const usernames = userData.map((item: any) => item?.username)
    
    const response = await Reporting.aggregate([
      {
        $match: {
          username: { $in: usernames }
        }
      },
      {
        $group: {
          _id: "$sportId",
          name: { $first: "$sportName" },
          sportId: { $first: "$sportId" },
          pl: { $sum: "$pl" },
          commission: { $sum: "$commission" }
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

const fetchCasinoTotalPL = async (data: any): Promise<void> => {
  try {
    const userData = await userService.getAllUsersDownlineUser(data?._id);
    const userIds = userData.map((item: any) => item?._id.toString())

    let resp = await AuraCSPlaceBet.aggregate([
      {
        $match: {
          userId: { $in: userIds }
        }
      },

      {
        $group: {
          _id: null,
          pl: { $sum: "$betInfo.pnl" },
          stack: { $sum: "$betInfo.reqStake" },
        }
      }
    ]);
    let datas = resp[0];
    datas = {...datas,name: 'Casino',id: '10'}
    resp[0]=datas
    return resp;

  } catch (error: any) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg || "invalid user id.",
    });
  }
}

const fetchIntCasinoTotalPL = async (data: any): Promise<void> => {
  try {
    const userData = await userService.getAllUsersDownlineUser(data?._id);
    const usernames = userData.map((item: any) => item?.username)
    let resp = await St8Transaction.aggregate([
      {
        $match: {
          username: { $in: usernames }
        }
      },

      {
        $group: {
          _id:null,
          pl: { $sum: "$pl" },
          stack: { $sum: "$amount" },
        }
      }
    ]);

    let datas = resp[0];
    datas = {...datas,name: 'Int Casino',id: '12'}
    resp[0]=datas
    return resp;

  } catch (error: any) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg || "invalid user id.",
    });
  }
}

const fetchAviatorTotalPL = async (data: any): Promise<void> => {
  try {
    const userData = await userService.getAllUsersDownlineUser(data?._id);
    const usernames = userData.map((item: any) => item?.username)
    const resp = await Avplacebet.aggregate([
      {
        $match: {
          user: { $in: usernames }
        }
      },

      {
        $group: {
          _id: null,
          id: { $first: "$sportId" },          
          name: { $first: "$sportName" },          
          pl: { $sum: "$pl" },
          stack: { $sum: "$stack" },
          // commission: 0
        }
      }
    ]);
    return resp;

  } catch (error: any) {
    console.log("error",error);
    
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg || "invalid user id.",
    });
  }
}

const fetchSportEventList = async (data: any, filter:any, options:any): Promise<void> => {
  try {
    const userData = await userService.getAllUsersDownlineUser(data?._id);
    const usernames = userData.map((item: any) => item?.username)
    filter.username = { $in: usernames }
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
    console.log("error",error);
    
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg || "invalid user id.",
    });
  }
}

const fetchAviatorList = async (data: any, options:any): Promise<void> => {
  try {
    const userData = await userService.getAllUsersDownlineUser(data?._id);
    const usernames = userData.map((item: any) => item?.username)
    const resp = await Avplacebet.paginate({user: { $in: usernames }},options);
    return resp;

  } catch (error: any) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg || "invalid user id.",
    });
  }
}

export { fetchSportTotalPL, fetchCasinoTotalPL, fetchIntCasinoTotalPL, fetchAviatorTotalPL, fetchSportEventList, fetchAviatorList }