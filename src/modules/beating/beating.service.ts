import { CricketBetPlace, Sport, User } from "@/models"
import ApiError from "@/utils/ApiError";
import httpStatus from "http-status";
import { checkParent } from "@/modules/user/user.service";

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
    console.log("data", data);
    const users = await User.find({
      $and: [
        {
          $expr: {
            $eq: [
              data?._id.toString(),
              {
                $arrayElemAt: ['$parentId', -1]
              }
            ]
          }
        }
      ]
    }).select('username');
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

export {
  bettingHistory,
  profitLoss,
  getSports,
  transaction,
  betList
}