import { CricketBetPlace, Sport } from "@/models"
import ApiError from "@/utils/ApiError";
import httpStatus from "http-status";
import { checkParent } from "@/modules/user/user.service";
import moment from "moment";

// const bettingHistory = async (data: any, type: string, from: string, to: string, status: string, userId: string, sportName: string): Promise<void> => {
const bettingHistory = async (data: any, filter: any, options: any): Promise<void> => {
  try {
    let username = data?.username;
    if (filter?.userId && filter?.userId != "") {
      const user = await checkParent(filter?.userId, data?._id);
      username = user?.username
    }
    filter.username = username;

    if (filter?.to) {
      filter.createdAt = new Date(filter.to);
      delete filter.to
    }

    if (filter?.from) {
      filter.createdAt = new Date(filter.from);
      delete filter.from
    }

    if ((filter?.from && filter?.from != "") && (filter?.to && filter?.to != "")) {
      delete filter.createdAt
      const date1 = moment(filter?.from, 'YYYY-MM-DD');
      const date2 = moment(filter?.to, 'YYYY-MM-DD');
      const diffInDays = date2.diff(date1, 'days');
      if (diffInDays >= 15) {
        throw new ApiError(httpStatus.BAD_REQUEST, {
          msg: "Please select only 15 days range only.",
        });
      }
      filter.createdAt = {
        $gte: new Date(filter?.from),
        $lte: new Date(filter?.to),
      }
      delete filter.to
      delete filter.from
    }

    const datas: any = await CricketBetPlace.paginate(filter, options)
    return datas;
  }
  catch (error: any) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg || "invalid user id.",
    });
  }
}

const profitLoss = async (data: any, type: string, from: string, to: string): Promise<void> => {
  return;
}

const transaction = async (data: any): Promise<void> => {
  return;
}


const getSports = async (): Promise<void> => {
  const data: any = await Sport.find().sort({ _id: -1 });
  return data;
}


export {
  bettingHistory,
  profitLoss,
  getSports,
  transaction
}