import { B2cUser, CreditLog, ProfileLog, Stake, User } from "@/models"
import ApiError from "@/utils/ApiError";
import httpStatus from "http-status";
import AWS from "aws-sdk";
import fs from 'fs';
import path from 'path';
import stakes from "@/config/stake";
import { ObjectId } from "mongodb";
import { hostUrl } from '../../utils/utils';

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
// const findMaxRole = async (rolesArray: any): Promise<string> => {
//   const rolesOrder = ['Admin', 'WhiteLabel', 'Super', 'Master', 'Agent', 'User'];

//   // Find the maximum role
//   const maxRole = rolesArray.reduce((max: string, currentRole: string) => {
//     const maxIndex = rolesOrder.indexOf(max);
//     const currentIndex = rolesOrder.indexOf(currentRole);
//     return currentIndex > maxIndex ? currentRole : max;
//   }, rolesOrder[0]);
//   let filter: any;
//   switch (maxRole) {
//     case 'Admin':
//       filter = 'WhiteLabel';
//       break;
//     case 'WhiteLabel':
//       filter = 'Super';
//       break;
//     case 'Super':
//       filter = 'Master';
//       break;
//     case 'Master':
//       filter = 'Agent';
//       break;
//     case 'Agent':
//       filter = 'User';
//       break;
//     case 'User':
//       filter = "";
//       break;
//     default:
//       filter = "";
//   }
//   return filter;
// }

// const getb2cUsers = async (managerId: string) => {
//   const b2cData = await B2cUser.find({ managerId });
//   return b2cData;
// }

const findDownline = async (data: any, filter: any, options: any): Promise<void> => {
  try {
    if (filter?.status === "") {
      delete filter.status;
    }

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
    // let maxRole = await findMaxRole(data.roles);
    if (filter?.userId && filter?.userId !== "") {
      // const user: any = await User.findOne({ _id: filter?.userId });
      // maxRole = await findMaxRole(user.roles);
      parentId = filter?.userId
      delete filter.userId
      delete filter.roles
    }

    const { limit = 10, page = 1 } = options;
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


    // let [results, totalResults] = await Promise.all([
    //   User.aggregate([
    //     {
    //       $match: query
    //     },
    //     {
    //       $sort: { createdAt: -1 }
    //     },
    //     {
    //       $skip: skip
    //     },
    //     {
    //       $limit: limit
    //     },
    //     { $unwind: "$parentId" },
    //      {
    //         $addFields: {
    //           parentId: { $toString: "$parentId" }
    //         }
    //       },
    //     {
    //       $lookup: {
    //         from: 'users',
    //         localField: '_id',
    //         foreignField: 'parentId',
    //         as: 'children'
    //       }
    //     },

    //     {
    //       $group: {
    //         _id: '$_id',
    //         username: { $first: '$username' },  // Use $first to preserve the parent fields
    //         // ... other fields
    //         isParent: { $first: '$isParent' },
    //         totalChildrenBalance: { $sum: '$children.balance' }  // Calculate total balance of children
    //       }
    //     },
    //   ]),
    //   User.countDocuments(query)
    // ]);

    let [results, totalResults] = await Promise.all([
      User.find(query).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    // const idArray = Array.from(results, item => item._id.toString());

    let finalResult: any = [];
    await Promise.all(results.map(async (item: any) => {
      let balance: number = item.balance > 0 ? parseFloat(item.balance.toString()) : 0;
      let exposure: number = parseInt(item.exposure ? item.exposure : 0);
      const childData: any = await User.aggregate([
        {
          $match: {
            $and: [
              { parentId: { $in: [item?._id.toString()] } },
              // { roles: { $in: ['User'] } }
            ]
          }
        },
        {
          $group:
          {
            _id: null,
            totalBalance: { $sum: '$balance' },
            totalExposure: { $sum: '$exposure' }
          }
        },
      ]);

      if (childData.length > 0) {
        balance += parseInt(childData[0].totalBalance.toString());
        exposure += parseInt(childData[0].totalExposure.toString());
      }
      const data: any = {
        createdAt: item?.createdAt,
        username: item.username,
        // balance: item.balance > 0 ? parseFloat(item.balance.toString()) : 0,
        balance,
        exposure,
        exposureLimit: item.exposureLimit || 0,
        _id: item._id,
        status: item?.parentStatus == "Active" ? item?.status : item?.parentStatus,
        roles: item.roles,
        creditRef: item.creditRef,
      }
      finalResult.push(data);
    }));

    finalResult = finalResult.sort(function (a: any, b: any) {
      const keyA = new Date(a.createdAt);
      const keyB = new Date(b.createdAt);
      if (keyA < keyB) return 1;
      if (keyA > keyB) return -1;
      return 0;
    });

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

const Register = async (body: any, user: any): Promise<void> => {

  const { username, password, mobile, ip, exposure, origin, commission, roles, isSportBook, isIntCasino, isCasino } = body
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
    creditRef: 0
  };
  if (roles == 'User') {
    data = { ...data, exposure: 0 };
    await Stake.create({
      username: username.toLowerCase().trim(),
      stakes
    })
  }
  if (roles === "WhiteLabel") {
    data = { ...data, origin, isSportBook, isIntCasino, isCasino }
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

    const { limit = 10, page = 1 } = options;
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
    const [results, totalResults] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    const resData: any = {
      results: results.map((item: any) => ({
        username: item.username,
        balance: item.balance > 0 ? parseFloat(item.balance.toString()) : 0,
        exposure: item.exposure || 0,
        exposureLimit: item.exposureLimit || 0,
        _id: item._id,
        status: item?.parentStatus == "Active" ? item?.status : item?.parentStatus,
        roles: item.roles,
        creditRef: item.creditRef,
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
  const data = await CreditLog.find({ username })
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

const myBalance = async (userData: any): Promise<void> => {

  const users = await User.find({ parentId: userData._id });
  const balanceSum = users.reduce((totalBel, currentUser) => totalBel + parseFloat(currentUser.balance.toString()), 0);

  const exposureSum = users.reduce((total, currentUser) => total + parseFloat(currentUser.exposure.toString()), 0);

  const res: any = {
    balance: parseFloat(userData.balance.toString()),
    exposureLimit: userData.exposureLimit,
    totalUser: users.length,
    totalBalance: balanceSum,
    totalExposure: exposureSum
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
      exposureLimit: data.exposureLimit,
      commission: data.commision,
      _id: data._id,
      timeZone: "IST",
      username: data.username
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

const updateProfile = async (userId: string, password: string, commission: number, mobile: string, myPassword: string, userData: any) => {
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
    // let type: string = "";
    // let old: string = "";
    // let newVal: string = "";
    const found = await checkParent(userId, userData._id);
    if (found) {
      if (password && password != "") {
        // old = ""
        found.password = password
        // type = "password";
        // newVal = password;
        await saveProfileLog(userData?.username, found?.username, "password", "", password)
      }

      if (mobile && mobile != "") {
        // old = found.mobile;
        found.mobile = mobile
        // type = "mobile";
        // newVal = mobile
      }

      if (commission && commission > 0) {
        // old = found.commision
        found.commision = commission
        // type = "commission";
        // newVal = commission.toString()
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


const profileLog = async (userId: string, user: any) => {
  let filter: any = { fromUser: user?.username }
  if (userId && userId != "") {
    const datas: any = await User.findOne({ _id: userId });
    if (!datas) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "user not found",
      });
    }
    filter = { ...filter, toUser: datas?.username }
  }
  const data: any = await ProfileLog.find(filter)
  return data;
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
  findUserById
}