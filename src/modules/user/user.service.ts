import { CreditLog, User } from "@/models"
import ApiError from "@/utils/ApiError";
import httpStatus from "http-status";
import AWS from "aws-sdk";
import fs from 'fs';
import path from 'path';

const csvWriter = require('csv-writer');
const findMaxRole = async (rolesArray: any): Promise<string> => {
  const rolesOrder = ['Admin', 'WhiteLabel', 'Super', 'Master', 'Agent', 'User'];

  // Find the maximum role
  const maxRole = rolesArray.reduce((max: string, currentRole: string) => {
    const maxIndex = rolesOrder.indexOf(max);
    const currentIndex = rolesOrder.indexOf(currentRole);
    return currentIndex > maxIndex ? currentRole : max;
  }, rolesOrder[0]);

  return maxRole;
}

const findDownline = async (data: any, filter: any, options: any,): Promise<void> => {
  try {
    if (filter?.status === "") {
      delete filter.status;
    }

    if (filter.search && filter.search != "") {
      filter.username = { $regex: filter.search, $options: "i" }
    }
    delete filter.search

    if (!data.roles) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "role not found",
      });
    }

    let maxRole = await findMaxRole(data.roles);
    if (filter?.userId === "") {
      const user: any = await User.findOne({ _id: filter?.userId });
      maxRole = await findMaxRole(user.roles);
    }

    switch (maxRole) {
      case 'Admin':
        filter.roles = { $in: ['WhiteLabel'] };
        break;
      case 'WhiteLabel':
        filter.roles = { $in: ['Super'] };
        break;
      case 'Super':
        filter.roles = { $in: ['Master'] };
        break;
      case 'Master':
        filter.roles = { $in: ['Agent'] };
        break;
      case 'Agent':
        filter.roles = { $in: ['User'] };
        break;
      case 'User':
        filter.roles = [];
        break;
      default:
        filter._id = null;
    }

    if (filter?.userId) {
      filter.parentId = { $in: [filter?.userId] }
    };

    let users: any = await User.paginate(filter, options);
    let response: any = [];
    if (users.results.length > 0) {
      await Promise.all(users.results.map(async (item: any) => {
        let ref = 0;
        const credit = await CreditLog.findOne({ username: item.username }).sort({ _id: -1 })
        if (credit) {
          ref = credit?.old;
        }
        const data: any = {}
        data.username = item.username,
          data.balance = item.balance > 0 ? parseFloat(item.balance.toString()) : 0,
          data.exposure = item.exposure || 0,
          data.exposureLimit = item.exposureLimit || 0,
          data._id = item._id,
          data.status = item.status,
          data.roles = item.roles,
          data.creditRef = ref
        response.push(data)
      }));
    }
    users.results = response;
    return users;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: "invalid user id.",
    });

  }
}

const Register = async (body: any, user: any): Promise<void> => {
  const { username, password, mobile, ip, exposure, commission, roles } = body
  const duplicate = await User.findOne({ username: username });
  if (duplicate) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: "Username already exist",
    });
  }
  await User.create({
    username,
    password: password,
    mobile,
    ip,
    roles: [roles],
    exposureLimit: exposure,
    commision: commission,
    parentId: user._id
  });
  return;
}

const myDownline = async (filter: any, options: any, userData: any): Promise<void> => {
  try {
    if (filter?.status === "") {
      delete filter.status;
    }

    if (filter.search && filter.search != "") {
      filter.username = { $regex: filter.search, $options: "i" }
    }
    delete filter.search
    filter.parentId = { $in: [userData?._id] }

    let users: any = await User.paginate(filter, options);
    let response: any = [];
    if (users.results.length > 0) {
      await Promise.all(users.results.map(async (item: any) => {
        let ref = 0;
        const credit = await CreditLog.findOne({ username: item.username }).sort({ _id: -1 })
        if (credit) {
          ref = credit?.old;
        }
        const data: any = {}
        data.username = item.username,
          data.balance = item.balance > 0 ? parseFloat(item.balance.toString()) : 0,
          data.exposure = item.exposure || 0,
          data.exposureLimit = item.exposureLimit || 0,
          data._id = item._id,
          data.status = item.status,
          data.roles = item.roles,
          data.creditRef = ref

        response.push(data)
      }));
    }
    users.results = response;
    return users;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: "invalid user id.",
    });
  }
}

const addCreditLog = async (userData: any, password: string, rate: number, userId: string): Promise<void> => {
  let user: any = await User.findOne({ username: userData.username })
  if (!(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: "wrong password",
    });
  }

  let found: any = await User.findOne({ _id: userId })
  if (found) {
    await CreditLog.create({
      username: found.username,
      old: found?.balance,
      new: rate
    });
    // found.balance = rate;
    // await found.save();
    return found;
  }
  return;
}

const getCreditLog = async (user: any, userId: string): Promise<void> => {
  let username = user?.username;
  if (userId !== "") {
    const data: any = await User.findOne({ _id: userId });
    if (!data) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "user not found",
      });
    }
    username = data.username
  }
  const data = await CreditLog.find({ username })
  return data;
}

const updateStatus = async (userData: any, password: string, status: string, userId: string, type: string): Promise<void> => {
  let user: any = await User.findOne({ username: userData.username })
  if (!(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: "wrong password",
    });
  }

  let found: any = await User.findOne({ _id: userId })
  if (!found) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: "selected user not found.",
    });
  }
  if (found) {
    type == "status" ?
      found.status = status : found.exposureLimit = status
    await found.save();
  }
  return found;
}

const myBalance = async (userData: any): Promise<void> => {

  const users = await User.find({ parentId: userData._id });
  const balanceSum = users.reduce((total, currentUser) => total + parseFloat(currentUser.balance.toString()), 0);

  const exposureLimitSum = users.reduce((total, currentUser) => total + parseFloat(currentUser.exposureLimit.toString()), 0);

  const res: any = {
    balance: parseFloat(userData.balance.toString()),
    exposureLimit: userData.exposureLimit,
    totalUser: users.length,
    totalBalance: balanceSum,
    totalExposure: exposureLimitSum
  }
  return res;
}

const exportCsv = async (username: string, status: string, userId: string): Promise<string> => {
  const result: any = await User.find({
    $or: [
      { "username": username },
      { "status": status }
    ],
    $and: [{ "parentId": userId }]
  })
  let resData: any[] = [];
  result.map((item: any) => {
    resData.push({
      account: item.username,
      creditRef: 0,
      balance: parseFloat(item.balance.toString()),
      exposure: 0,
      availBal: parseFloat(item.balance.toString()),
      exposureLimit: item.exposureLimit,
      ref: 0,
      status: item.status
    });
  });

  const fileName = `data_${Date.now()}.csv`;
  const filePath = path.resolve(__dirname, fileName);
  const bucketName = 'exch-s3-react-dev-002';
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

  await writer.writeRecords(resData).then(async () => {
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
  let data: any = userData;
  if (userId !== "") {
    data = await User.findOne({ _id: userId });
    if (!data) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "user not found",
      });
    }

    if (!data.parentId == userData._id) {
      throw new ApiError(httpStatus.BAD_REQUEST, {
        msg: "you are not refered to this user.",
      });
    }
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
  accountDetail
}