import { CricketBetPlace, AuraCSPlaceBet, TennisBetPlace, SoccerBetPlace, Avplacebet, St8Transaction } from "@/models"
import ApiError from "@/utils/ApiError";
import httpStatus from "http-status";
import * as userService from "@/modules/user/user.service";

const fetchSportTotalPL = async (data: any): Promise<void> => {
  try {

    const userData = await userService.getMyUsersData(data?._id);
    const usernames = userData.map((item: any) => item?.username)
    const cricketData = await CricketBetPlace.aggregate([
      {
        $match: {
          username: { $in: usernames }
        }
      },

      {
        $group: {
          _id: null,
          name: { $first: "$sportName" },
          sportId: { $first: "$sportId" },
          totalSum: { $sum: "$pl" },
          totalStack: { $sum: "$stake" }
        }
      }
    ]);

    const tennisData = await TennisBetPlace.aggregate([
      {
        $match: {
          username: { $in: usernames }
        }
      },

      {
        $group: {
          _id: null,
          name: { $first: "$sportName" },
          sportId: { $first: "$sportId" },
          totalSum: { $sum: "$pl" },
          totalStack: { $sum: "$stake" }
        }
      }
    ]);

    const soccerData = await SoccerBetPlace.aggregate([
      {
        $match: {
          username: { $in: usernames }
        }
      },

      {
        $group: {
          _id: null,
          name: { $first: "$sportName" },
          sportId: { $first: "$sportId" },
          totalSum: { $sum: "$pl" },
          totalStack: { $sum: "$stake" }
        }
      }
    ]);
    const resp: any = [{
      id: cricketData[0]?.sportId,
      name: cricketData[0]?.name,
      stack: cricketData[0]?.totalStack,
      pl: cricketData[0]?.totalSum,
      commission:0
    },
    {
      id: tennisData[0]?.sportId,
      name: tennisData[0]?.name,
      stack: tennisData[0]?.totalStack,
      pl: tennisData[0]?.totalSum,
      commission:0
    },
    {
      id: soccerData[0]?.sportId,
      name: soccerData[0]?.name,
      stack: soccerData[0]?.totalStack,
      pl: soccerData[0]?.totalSum,
      commission:0
    }]
    return resp;

  } catch (error: any) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg || "invalid user id.",
    });
  }
}

const fetchCasinoTotalPL = async (data: any): Promise<void> => {
  try {
    const userData = await userService.getMyUsersData(data?._id);
    const userIds = userData.map((item: any) => item?._id.toString())

    const resp = await AuraCSPlaceBet.aggregate([
      {
        $match: {
          userId: { $in: userIds }
        }
      },

      {
        $group: {
          _id: null,
          name: 'Casino',
          id: '10',
          pl: { $sum: "$betInfo.pnl" },
          stack: { $sum: "$betInfo.reqStake" },
          commission: 0
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

const fetchIntCasinoTotalPL = async (data: any): Promise<void> => {
  try {
    const userData = await userService.getMyUsersData(data?._id);
    const usernames = userData.map((item: any) => item?.username)
    const resp = await St8Transaction.aggregate([
      {
        $match: {
          username: { $in: usernames }
        }
      },

      {
        $group: {
          _id:null,
          name: 'Int Casino',
          id: '12',
          pl: { $sum: "$pl" },
          stack: { $sum: "$amount" },
          commission: 0
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

const fetchAviatorTotalPL = async (data: any): Promise<void> => {
  try {
    const userData = await userService.getMyUsersData(data?._id);
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
          name: 'Aviator',
          pl: { $sum: "$pl" },
          stack: { $sum: "$stack" },
          commission:0
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

const fetchSportEventList = async (data: any, filter:any, options:any): Promise<void> => {
  try {
    const userData = await userService.getMyUsersData(data?._id);
    const usernames = userData.map((item: any) => item?.username)
    let result: any = [];
    // if (filter.sportName === 'Cricket') {
      const cricket = await CricketBetPlace.aggregate([
        {
          $match: {
            username: { $in: usernames }
          }
        },

        {
          $group: {
            _id: "$exEventId",
            eventName: { $first: "$eventName" },
            totalPl: { $sum: "$pl" }
          }
        }
      ]);
    // }

    const tennis = await TennisBetPlace.aggregate([
      {
        $match: {
          username: { $in: usernames }
        }
      },

      {
        $group: {
          _id: "$exEventId",
          eventName: { $first: "$eventName" },
          totalPl: { $sum: "$pl" }
        }
      }
    ]);

    const soccer = await SoccerBetPlace.aggregate([
      {
        $match: {
          username: { $in: usernames }
        }
      },

      {
        $group: {
          _id: "$exEventId",
          eventName: { $first: "$eventName" },
          totalPl: { $sum: "$pl" }
        }
      }
    ]);
    const resp:any ={cricket, tennis, soccer }
    return resp;

  } catch (error: any) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg || "invalid user id.",
    });
  }
}

const fetchAviatorList = async (data: any, options:any): Promise<void> => {
  try {
    const userData = await userService.getMyUsersData(data?._id);
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