import { CreditLog, User } from "@/models"
import ApiError from "@/utils/ApiError";
import httpStatus from "http-status";
import bcrypt from 'bcryptjs';
import AWS from "aws-sdk";
import fs from 'fs';
import path from 'path';

const csvWriter = require('csv-writer');
const findMaxRole = async (rolesArray: any): Promise<string> => {
  const rolesOrder = ['Admin', 'White Label', 'Super', 'Master', 'Agent', 'User'];

  // Find the maximum role
  const maxRole = rolesArray.reduce((max: string, currentRole: string) => {
    const maxIndex = rolesOrder.indexOf(max);
    const currentIndex = rolesOrder.indexOf(currentRole);
    return currentIndex > maxIndex ? currentRole : max;
  }, rolesOrder[0]);

  return maxRole;
}

const findDownline = async (data: any, userId: string): Promise<void> => {

  if (!data.roles) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: "role not found",
    });
  }

  let maxRole = await findMaxRole(data.roles);
  if (userId) {
    const user: any = await User.findOne({ _id: userId });
    maxRole = await findMaxRole(user.roles);
  }

  let query = {};

  switch (maxRole) {
    case 'Admin':
      break;
    case 'White Label':
      query = { roles: { $in: ['Super'] } };
      break;
    case 'Super':
      query = { roles: { $in: ['Master'] } };
      break;
    case 'Master':
      query = { roles: { $in: ['Agent'] } };
      break;
    case 'Agent':
      query = { roles: { $in: ['User'] } };
      break;
    case 'User':
      query = { roles: [] };
      break;
    default:
      query = { _id: null };
  }

  if (userId) {
    query = { ...query, parentId: userId };
    const users: any = await User.find(query);
    return users;
  }
}

const Register = async (body: any, user: any): Promise<void> => {
  const { username, password, mobile, ip, exposure, commision, roles } = body
  const duplicate = await User.findOne({ username: username });
  if (duplicate) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: "Username already exist",
    });
  }
  const hashedPwd = await bcrypt.hash(password, 10);
  await User.create({
    username,
    password: hashedPwd,
    mobile,
    ip,
    roles:[roles],
    exposureLimit: exposure,
    commision: commision,
    parentId: user.id
  });
  return;
}

const myDownline = async (user: any): Promise<void> => {
  const users: any = await User.find({ parentId: user.id });
  return users;
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
      userId: userId,
      old: found?.balance,
      new: rate
    });
    found.balance = rate;
    await found.save();
    return found;
  }
  return;
}

const getCreditLog = async (user: any): Promise<void> => {
  const data = await CreditLog.find({ username: user.username })
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

const search = async (username: string, status: string, userId: string): Promise<void> => {
  const data: any = await User.find({
    $or: [
      { "username": username },
      { "status": status }
    ],
    $and: [{ "parentId": userId }]
  })
  return data;
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

const accountDetail = async (userId: string): Promise<void> => {
  const data: any = await User.findOne({ _id: userId });
  const dataNew: any = {
    balance: data.balance>0?parseFloat(data.balance.toString()):0,
    mobile: data.mobile,
    exposureLimit: data.exposureLimit,
    commision: data.commision,
    password: data.password,
    _id: data._id,
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
  search,
  myBalance,
  exportCsv,
  accountDetail
}