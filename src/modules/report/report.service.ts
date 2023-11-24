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
          _id: 'cricket',
          totalSum: { $sum: "$pl" }
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
          _id: 'tennis',
          totalSum: { $sum: "$pl" },
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
          _id: 'soccer',
          totalSum: { $sum: "$pl" }
        }
      }
    ]);
    const resp: any = [{
      _id: 'Cricket',
      totalPl: cricketData[0]?.totalSum
    },
    {
      _id: 'Tennis',
      totalPl: tennisData[0]?.totalSum
    },
    {
      _id: 'Soccer',
      totalPl: soccerData[0]?.totalSum
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
          _id: 'Casino',
          totalPl: { $sum: "$betInfo.pnl" }
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
          _id: 'Int Casino',
          totalPl: { $sum: "$pl" }
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
          _id: 'Aviator',
          totalPl: { $sum: "$pl" }
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

export { fetchSportTotalPL, fetchCasinoTotalPL, fetchIntCasinoTotalPL, fetchAviatorTotalPL }