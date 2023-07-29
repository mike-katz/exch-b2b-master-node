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
    roles: roles != "" ? [roles] : ["User"],
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

const search = async (status: string, username: string, userId: string): Promise<void> => {

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

const exportCsv = async (userData: any): Promise<string> => {

  const countries: any = [
    { name: 'Cameroon', capital: 'Yaounde', countryCode: 'CM', phoneIndicator: 237 },
    { name: 'France', capital: 'Paris', countryCode: 'FR', phoneIndicator: 33 },
    { name: 'United States', capital: 'Washington, D.C.', countryCode: 'US', phoneIndicator: 1 },
    { name: 'India', capital: 'New Delhi', countryCode: 'IN', phoneIndicator: 91 },
    { name: 'Brazil', capital: 'Brasília', countryCode: 'BR', phoneIndicator: 55 },
    { name: 'Japan', capital: 'Tokyo', countryCode: 'JP', phoneIndicator: 81 },
    { name: 'Australia', capital: 'Canberra', countryCode: 'AUS', phoneIndicator: 61 },
    { name: 'Nigeria', capital: 'Abuja', countryCode: 'NG', phoneIndicator: 234 },
    { name: 'Germany', capital: 'Berlin', countryCode: 'DE', phoneIndicator: 49 },
  ];

  const fileName = `data_${Date.now()}.csv`;
  const filePath = path.resolve(__dirname, fileName);
  const bucketName = 'exch-s3-react-dev-002';
  const Key = `csv-files/${fileName}`;
  const writer = csvWriter.createObjectCsvWriter({
    path: filePath,
    header: [
      { id: 'name', title: 'Name' },
      { id: 'countryCode', title: 'Country Code' },
      { id: 'capital', title: 'Capital' },
      { id: 'phoneIndicator', title: 'International Direct Dialling' },
    ],
  });

  await writer.writeRecords(countries).then(async () => {
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
      const s3FileUrl = `https://${bucketName}.s3.amazonaws.com/${Key}`;
      console.log("s3FileUrl",s3FileUrl);
    } catch (error) {
      console.error('Error uploading file to S3:', error);
       throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, {
      msg: "issue with s3 bucket file upload",
    });
    }
  });
  const s3FileUrl:string = `https://${bucketName}.s3.amazonaws.com/${Key}`;

  return s3FileUrl; 
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
  exportCsv
}