import { CreditLog, ProfileLog, Stake, User, ExposureManage,CricketBetPlace,TennisBetPlace,SoccerBetPlace } from "@/models"
import ApiError from "@/utils/ApiError";
import httpStatus from "http-status";
import AWS from "aws-sdk";
import fs from 'fs';
import path from 'path';
import stakes from "@/config/stake";
import { ObjectId } from "mongodb";
import { hostUrl } from '../../utils/utils';
import { getFilterProfitLoss } from "../pl/pl.service";

const findUserByUsername = (username: string) => {
  const user: any = User.findOne({ username });
  return user
}
const findUserById = async (userId: string) => {
  const id = new ObjectId(userId);
  const user: any = await User.findById({ _id: id });
  return user
}
const csvWriter = require('csv-writer');

const findDownline = async (data: any, filter: any, options: any): Promise<void> => {
  try {
    if (filter?.status === "") {
      delete filter.status;
    }

    let currentRole = data.roles;

    if (filter.search !== undefined && filter.search != "") {
      filter.username = { $regex: filter?.search, $options: "i" }
    }
    delete filter.search

    if (!data.roles) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "role not found",
      });
    }
    filter.roles = { $nin: ['User'] };

    let parentId = data?._id
    if (filter?.userId && filter?.userId !== "") {
      parentId = filter?.userId

    const found = await findUserById(parentId);
      if (found) {
        currentRole = found.roles;
      }
      
      delete filter.userId
      delete filter.roles
    }

    const { limit = 10, page = 1, sortBy = "createdAt", order = "-1" } = options;
    const skip = (page - 1) * limit;
    let query: any = {
      $and: [
        {
          $expr: {
            $eq: [
              parentId.toString(),
              {
                $arrayElemAt: ['$parentId', -1]
              }
            ]
          }
        },
        filter
      ]
    }
    let sortSetting: any;
    if (sortBy !== "balance") {
      sortSetting = { [sortBy]: parseInt(order) }
    } else {
      sortSetting = { newField: parseInt(order) }
    }

    let results:any = [];
    let totalResults:number = 0;
    if (currentRole.includes('Agent')) {
      const objOpt = {
        limit,
        page,
        sortBy: sortBy+":"+(parseInt(order) === -1 ? "desc":"asc"),
      }
      
      const userData:any = await User.paginate(query, objOpt);
      results = userData.results;
      totalResults = userData.totalResults
    } else {
      let pipeline: any = [
        {
          $match: query
        },
        {
          $addFields: {
            newField: { $sum: ['$balance', '$exposure'] },
            isUser: {
              $in: ["User", "$roles"]
            }
          }
        },
        {
          $lookup: {
            from: 'users',
            let: { id: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: [{ $toString: "$$id" }, "$parentId"]
                  }
                }
              },
              {
                $group: {
                  _id: "$$id",
                  downlineBalance: { $sum: '$balance' },
                  downlineExposure: { $sum: '$exposure' }
                }
              }
            ],
            as: 'downline'
          }
        },
        {
          $addFields: {
            downlineCount: { $size: '$downline' }
          }
        },
        {
          $addFields: {
            downline: {
              $cond: {
                if: { $eq: [{ $size: '$downline' }, 0] },
                then: [
                  {
                    _id: "$_id",
                    downlineBalance: 0,
                    downlineExposure: 0
                  }
                ],
                else: "$downline"
              }
            }
          }
        },
        {
          $unwind: '$downline'
        },
        { $sort: sortSetting },
        { $skip: skip },
        { $limit: limit }
      ];
      results = await User.aggregate(pipeline);
      totalResults = await User.countDocuments(query);
    }
    let finalResult: any = [];
    await Promise.all(results.map(async (item: any) => {

      let balance: number = (Number(item?.balance) || 0);
      let exposure: number = (Number(item?.exposure) || 0);
      const data: any = {
        createdAt: item?.createdAt,
        username: item.username,
        // balance: item.balance > 0 ? parseFloat(item.balance.toString()) : 0,
        balance,
        exposure,
        exposureLimit: item.exposureLimit || 0,
        _id: item._id,
        status: item?.parentStatus == "Active" ? item?.status : item?.parentStatus || item?.status,
        roles: item.roles,
        creditRef: Number(item?.creditRef) || Number(item?.creditReference) || 0,
        downlineBalance: (Number(item?.downline?.downlineBalance) || 0),
        downlineExposure: (Number(item?.downline?.downlineExposure) || 0)
      }
      finalResult.push(data);
    }));

    const resData: any = {
      page,
      limit,
      totalPages: Math.ceil(totalResults / limit),
      totalResults,
      results: finalResult
    };
    return resData;
  } catch (error: any) {
    console.log("error", error);

    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg || "invalid user id.",
    });
  }
}

function generateRandomString(length: number) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}

const Register = async (body: any, user: any): Promise<void> => {

  const { username, password, mobile, ip, exposure, origin, commission, roles, isSportBook, isIntCasino, isCasino, isAviator } = body
  const duplicate = await findUserByUsername(username);
  if (duplicate) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: "Username already exist",
    });
  }

  if (commission > 100) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: "Please enter lower then 100",
    });
  }

  if (user?.commision > commission) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: "Please add higher then your commision",
    });
  }

  if (roles === "WhiteLabel" && origin === '') {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: "origin required.",
    });
  }
  const parentId = [...user?.parentId]
  parentId.push(user?._id);
  console.log('parentId: ', parentId);

  let originStr = origin;
  const parts = originStr.split('.')
  if (parts.length === 3) {
    parts.shift();
    originStr = hostUrl(parts.join('.'));
  }
  const selfReferral = generateRandomString(6)
  let data: any = {
    username: username.toLowerCase().trim(),
    password: password,
    mobile,
    ip,
    roles: [roles],
    exposureLimit: exposure,
    origin: originStr,
    commision: commission,
    parentId,
    creditRef: 0,
    selfReferral
  };
  if (roles == 'User') {
    data = { ...data, exposure: 0 };
    await Stake.create({
      username: username.toLowerCase().trim(),
      stakes
    })
  }
  if (roles === "WhiteLabel") {
    data = { ...data, origin, isSportBook, isIntCasino, isCasino, isAviator }
  }
  await User.create(data);
  return;
}

const myDownline = async (filter: any, options: any, userData: any): Promise<void> => {
  try {
    if (filter?.status === "") {
      delete filter.status;
    }

    if (filter.search !== undefined && filter.search != "") {
      filter.username = { $regex: filter?.search, $options: "i" }
    }
    delete filter.search
    let parentId: string = userData?._id;
    filter.roles = { $in: ['User'] };

    const { limit = 10, page = 1, sortBy = "createdAt", order = "-1" } = options;
    const skip = (page - 1) * limit;
    let query: any = {
      $and: [
        {
          $expr: {
            $eq: [
              parentId.toString(),
              {
                $arrayElemAt: ['$parentId', -1]
              }
            ]
          }
        },
        filter
      ]
    }
    //Agent use only
    if (userData?.roles.includes('Agent') && userData?.branch && userData?.branch != "") {
      query = {
        branch: userData?.branch,
        roles: { $in: ["User"] }
      }
    }

    let sortSetting = { [sortBy]: order };
    let results: any = [];
    let totalResults: number = 0
    if (sortBy !== "balance") {
      [results, totalResults] = await Promise.all([
        User.find(query).sort(sortSetting).skip(skip).limit(limit),
        User.countDocuments(query),
      ]);
    } else {
      let pipeline: any = [
        { $match: query },
        {
          $addFields: { newField: { $sum: ['$balance', '$exposure'] } }
        },
        { $sort: { newField: parseInt(order) } },
        { $skip: skip },
        { $limit: limit }
      ];
      results = await User.aggregate(pipeline);
      totalResults = await User.countDocuments(query);
    }

    const resData: any = {
      results: results.map((item: any) => ({
        username: item.username,
        balance: (Number(item?.balance) || 0),
        exposure: item.exposure || 0,
        exposureLimit: item.exposureLimit || 0,
        _id: item._id,
        status: item?.parentStatus == "Active" ? item?.status : item?.parentStatus || item?.status,
        roles: item.roles,
        creditRef: Number(item?.creditRef) || Number(item?.creditReference) || 0,
        createdAt: item.createdAt,
      })),
      page,
      limit,
      totalPages: Math.ceil(totalResults / limit),
      totalResults,
    };

    return resData;
  } catch (error: any) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg || "invalid user id.",
    });
  }
}

const addCreditLog = async (userData: any, password: string, rate: number, userId: string): Promise<void> => {
  let user: any = await findUserByUsername(userData.username);
  if (!(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: "wrong password",
    });
  }
  let found = await checkParent(userId, userData._id);
  if (found) {
    await CreditLog.create({
      username: found.username,
      old: found?.creditRef || 0,
      new: rate
    });
    found.creditRef = rate;
    await found.save();
    return found;
  }
  return;
}

const getCreditLog = async (user: any, userId: string): Promise<void> => {
  let username = user?.username;
  if (userId) {
    const data = await checkParent(userId, user._id);
    username = data.username
  }
  const data = await CreditLog.find({ username }).sort({ createdAt: -1 })
  const resp: any = { data, username };
  return resp;
}

const updateStatus = async (userData: any, password: string, status: string, userId: string, type: string): Promise<void> => {
  try {
    const user: any = await findUserByUsername(userData.username);
    if (!(await user.isPasswordMatch(password))) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "wrong password",
      });
    }

    const found = await checkParent(userId, user._id);
    if (found) {
      let types = "";
      let old = "";
      if (type !== "status") {
        old = found.exposureLimit;
        found.exposureLimit = status
        types = "exposure";
      }

      if (type == "status") {
        types = "status";
        old = found.status;
        found.status = status
        const users: any = await User.distinct("_id", { parentId: { $in: [userId] } });
        await User.updateMany(
          { _id: { $in: users } },
          { $set: { parentStatus: status } }
        );
      }
      // await saveProfileLog(user?.username, found?.username, "exposure", old, status)
      await found.save();
    }
    return found;
  }
  catch (error: any) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg || "invalid user id.",
    });
  }
}

const myBalance = async (userData: any): Promise<any> => {
   const pipeline = [
      { $match: { parentId: { $in: [userData._id.toString()] } } },
      {
        $group: {
          _id: null,
          balanceSum: { $sum: "$balance"  },
          exposureSum: { $sum: "$exposure" },
          totalUser: { $sum: 1 },
        },
      },
   ];
  
  const aggregationResult = await User.aggregate(pipeline);
  const { balanceSum =0, exposureSum =0, totalUser=0 } = aggregationResult[0];
  const res: any = {
    balance: (Number(userData?.balance).toFixed(2) || 0),
    exposureLimit: userData?.exposureLimit,
    totalUser,
    totalBalance: Number(balanceSum).toFixed(2),
    totalExposure: Number(exposureSum).toFixed(2)
  }
  return res;
}

const exportCsv = async (search: string, status: string, userId: string, type: string, userData: any): Promise<string> => {
  let responseData: any = [];
  let filter: any = {}
  if (status) {
    filter.status = status
  }
  if (search && search != "") {
    filter.username = { $regex: search, $options: "i" }
  }

  let parentId = userData?._id

  if (type == "user") {
    if (userId && userId != "") {
      parentId = userId;
    }
  }
  if (type == "master") {
    filter.roles = { $nin: ['User'] };
    if (userId !== undefined && userId !== "") {
      parentId = userId
      delete filter.roles
    }
  }
  const query = {
    $and: [
      {
        $expr: {
          $eq: [
            parentId.toString(),
            {
              $arrayElemAt: ['$parentId', -1]
            }
          ]
        }
      },
      filter
    ]
  }

  responseData = await User.find(query);
  let response: any = [];
  if (responseData.length > 0) {
    await Promise.all(responseData.map(async (item: any) => {
      const data: any = {}
      data.account = item.username,
        data.creditRef = item.creditRef,
        data.availBal = item.balance > 0 ? parseFloat(item.balance.toString()) : 0,
        data.exposure = item.exposure || 0,
        data.balance = item.balance > 0 ? parseFloat(item.balance.toString()) : 0,
        data.exposureLimit = item.exposureLimit || 0,
        data.status = item?.parentStatus == "Active" ? item?.status : item?.parentStatus;
      data.ref = (parseFloat(item.creditRef) || 0) + (parseFloat(item.balance) || 0);
      response.push(data)
    }));
  }
  const fileName = `data_${Date.now()}.csv`;
  const filePath = path.resolve(__dirname, fileName);
  const bucketName = 'bx-s3-dev-001';
  const Key = `csv-files/${fileName}`;
  const writer = csvWriter.createObjectCsvWriter({
    path: filePath,
    header: [
      { id: 'account', title: 'Account' },
      { id: 'creditRef', title: 'Credit Ref' },
      { id: 'balance', title: 'Balance' },
      { id: 'exposure', title: 'Exposure' },
      { id: 'availBal', title: 'Available Balance' },
      { id: 'exposureLimit', title: 'Exposure Limit' },
      { id: 'ref', title: 'Ref P/L' },
      { id: 'status', title: 'Status' },
    ],
  });

  await writer.writeRecords(response).then(async () => {
    // Uploading to S3
    const s3: any = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS,
      secretAccessKey: process.env.AWS_SECRETS,
      signatureVersion: "v4",
    });

    const fileContent = fs.readFileSync(filePath);
    const params = {
      Bucket: bucketName,
      Key,
      Body: fileContent,
    };

    try {
      await s3.putObject(params).promise();
      await fs.unlinkSync(filePath)
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, {
        msg: "issue with s3 bucket file upload",
      });
    }
  });
  const s3FileUrl: string = `https://${bucketName}.s3.amazonaws.com/${Key}`;
  return s3FileUrl;
}

const accountDetail = async (userId: string, userData: any): Promise<void> => {
  try {
    let data: any = userData;
    if (userId) {
      data = await checkParent(userId, userData._id);
    }
    const dataNew: any = {
      balance: data.balance > 0 ? parseFloat(data.balance.toString()) : 0,
      mobile: data.mobile,
      exposure: data.exposure,
      exposureLimit: data.exposureLimit,
      commission: data.commision,
      _id: data._id,
      timeZone: "IST",
      username: data.username,
      isSportBook: data.isSportBook,
      isIntCasino: data.isIntCasino,
      isCasino: data.isCasino,
      isAviator: data.isAviator,
      roles: data.roles,
      selfReferral: data.selfReferral,
      registeredReferral: data.registeredReferral,
    }
    return dataNew;
  } catch (error: any) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg || "invalid user id.",
    });
  }
}

const checkParent = async (userId: string, loginedId: string) => {
  const data: any = await User.findOne({ _id: userId });
  if (!data) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: "user not found",
    });
  }

  if (!data.parentId.includes(loginedId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: "you are not refered to this user.",
    });
  }
  return data;
}

const getParentUsername = async (userId: string) => {
  const data: any = await User.findOne({ _id: userId });
  const parentId = data?.parentId || [];
  parentId.push(userId);
  const userData = await User.find({ _id: { $in: parentId } }).select("username roles");
  return userData;
};

const updateProfile = async (body: any, userData: any) => {

  const { userId, password, commission, mobile, myPassword, isSportBook, isIntCasino, isCasino, isAviator } = body;
  try {

    const user: any = await findUserByUsername(userData.username);
    if (!(await user.isPasswordMatch(myPassword))) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "wrong password",
      });
    }

    if (commission > 100) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "Please enter lower then 100",
      });
    }

    if (user?.commision > commission) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "Please add higher then your commision",
      });
    }
    const found = await findUserById(userId);
    if (found) {
      if (password !== "" || mobile !== "" || commission > 0) {
        const lastParent = found?.parentId[found?.parentId?.length - 1];
        if (lastParent !== userData?._id.toString()) {
          throw new ApiError(httpStatus.BAD_REQUEST, {
            msg: "You can not update details",
          });
        }

        if (password && password != "") {
          found.password = password
          await saveProfileLog(userData?.username, found?.username, "password", "-", "-")
        }

        if (mobile && mobile != "") {
          found.mobile = mobile
        }

        if (commission && commission > 0) {
          found.commision = commission
        }
      }

      // if (found.roles.includes('WhiteLabel')) {
      if (isSportBook !== undefined || isIntCasino !== undefined || isCasino !== undefined || isAviator !== undefined) {
        if (!userData.roles.some((role: any) => ['WhiteLabel', 'Admin'].includes(role))) {
          throw new ApiError(httpStatus.BAD_REQUEST, {
            msg: "you are not admin or whitelabel",
          });
        }
        console.log("if found")
        if (isSportBook !== undefined) {
          found.isSportBook = isSportBook
        }
        if (isIntCasino !== undefined) {
          found.isIntCasino = isIntCasino
        }
        if (isCasino !== undefined) {
          found.isCasino = isCasino
        }
        if (isAviator !== undefined) {
          found.isAviator = isAviator
        }
      }
      await found.save();
    }
  }
  catch (error: any) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg || "invalid user id.",
    });
  }
};

const saveProfileLog = async (fromUser: string, toUser: string, type: string, old: string, newVal: string) => {
  await ProfileLog.create({
    fromUser,
    toUser,
    type,
    old,
    new: newVal
  })
}


const profileLog = async (userId: string, user: any, options: any) => {
  let filter: any = { fromUser: user?.username }
  let username = user?.username;
  if (userId && userId != "") {
    const datas: any = await User.findOne({ _id: userId });
    if (!datas) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "user not found",
      });
    }
    username = datas?.username;
    filter = { ...filter, toUser: datas?.username }
  }
  const data: any = await ProfileLog.paginate(filter, options)
  return { data, username };
}


const getAllUsersDownlineUser = async (userId: string) => {
  const userData: any = await User.find({ parentId: { $in: [userId] } }).select('username');
  return userData;
}

const getExposureList = async (userId: string) => {
  const userData: any = await User.findOne({ _id: userId });
  if (!userData) {
    throw new ApiError(httpStatus.OK, {
      msg: "user not found",
    });
  }
  // const result: any = await ExposureManage.aggregate([
  //   {
  //     $match: {
  //       username: userData.username,
  //       exposure: { $gt: 0 },
  //     },
  //   },
  //  {
  //     $lookup: {
  //       from: 'marketRates',
  //       localField: 'exMarketId',
  //       foreignField: 'exMarketId',
  //       as: 'cricketbetplace',
  //     },
  //   },
   
  //   {
  //     $unwind: {
  //       path: "$cricketbetplace",
  //       preserveNullAndEmptyArrays: true
  //     }
  //   },
    // {
    //   $project: {
    //     _id: 0,
    //     exposure: 1,
    //     exEventId: 1,
    //     exMarketId: 1,
    //     createdAt: 1,
  //       eventName: {
  //         $cond: {
  //           if: { $ne: ["$cricketbetplace", null] },
  //           then: '$cricketbetplace.eventName',
  //           else: {
  //             $cond: {
  //               if: { $ne: ["$tennisbetplace", null] },
  //               then: '$tennisbetplace.eventName',
  //               else: '$soccerbetplace.eventName'
  //             }
  //           }
  //         }
  //       },
  //       marketName: {
  //         $cond: {
  //           if: { $ne: ["$cricketbetplace", null] },
  //           then: '$cricketbetplace.marketType',
  //           else: {
  //             $cond: {
  //               if: { $ne: ["$tennisbetplace", null] },
  //               then: '$tennisbetplace.marketType',
  //               else: '$soccerbetplace.marketType'
  //             }
  //           }
  //         }
  //       },
  //     },
  //   },
    // {
    //   $group: {
    //     _id: "$exMarketId",
    //     exposure: { $first: "$exposure" },
    //     exEventId: { $first: "$exEventId" },
    //     createdAt: { $first: "$createdAt" },
    //     eventName: { $first: "$eventName" },
    //     marketName: { $first: "$marketName" },
    //   },
    // },
    // {
    //   $sort: { _id: -1 },
    // },
  // ]);
  const result: any = await ExposureManage.aggregate([
    {
      $match: {
        username: userData.username,
        exposure: { $gt: 0 },
      },
    },
    {
    $lookup: {
      from: "marketresults", 
      localField: "exMarketId",
      foreignField: "exMarketId",
      as: "marketResult",
    },
  },
  {
    $match: {
      $or: [
        { "marketResult": { $size: 0 } },
        { "marketResult.IsUnsettle": { $eq: 1 } }
      ],
    },
  },
    {
      $project: {
        _id: "$exMarketId",
        exposure: 1,
        exEventId: 1,
        marketName: 1,
        eventName: 1,
        createdAt: 1,
      }
    },
    {
      $sort: { _id: -1 },
    },
    
  ]);
  return result || [];
}

const getUserBetList = async (userId:string,filter:any,options:any) => {
  const userData: any = await User.findOne({ _id: userId });
  if (!userData) {
    throw new ApiError(httpStatus.OK, {
      msg: "user not found",
    });
  }
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
  filter = { ...filter, username:userData?.username, exMarketId: filter?.marketId }
  delete filter.marketId;
  let resultData = await CricketBetPlace.paginate(filter, options);
  if (resultData.results.length === 0) {
    resultData = await TennisBetPlace.paginate(filter, options);
  }
  if (resultData.results.length === 0) {
    resultData = await SoccerBetPlace.paginate(filter, options);
  }
  const resultArr:any = [];

  if (resultData.results.length > 0) {
    resultData.results.map((data:any) => {
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
      if (result.type === 'lay' || result.type === 'no') {
        const temp = -result.pl1;
        result.pl1 = Math.abs(result.pl2);
        result.pl2 = temp;
      }
      resultArr.push(result);
    });
  }
  resultData.results = resultArr;
  

  return resultData || [];
}

export {
  findDownline,
  Register,
  myDownline,
  addCreditLog,
  getCreditLog,
  updateStatus,
  myBalance,
  exportCsv,
  accountDetail,
  checkParent,
  getParentUsername,
  updateProfile,
  saveProfileLog,
  profileLog,
  findUserByUsername,
  findUserById,
  getAllUsersDownlineUser,
  getExposureList,
  getUserBetList
}