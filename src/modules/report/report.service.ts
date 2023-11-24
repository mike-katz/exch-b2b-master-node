import { CricketBetPlace, TennisBetPlace, SoccerBetPlace, User } from "@/models"
import ApiError from "@/utils/ApiError";
import httpStatus from "http-status";
import * as userService from "@/modules/user/user.service";

const fetchSportTotalPL = async (data: any): Promise<void> => {
  try {
    const usernames = await userService.getMyUsersData(data?._id.toString());
    // console.log("usernames",usernames);

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
      name: 'Cricket',
      totalPl: cricketData[0]?.totalSum
    },
    {
      name: 'Tennis',
      totalPl: tennisData[0]?.totalSum
    },
    {
      name: 'Soccer',
      totalPl: soccerData[0]?.totalSum
    }]
    return resp;

  } catch (error: any) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg || "invalid user id.",
    });
  }
}

export { fetchSportTotalPL }