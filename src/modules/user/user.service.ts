import { CreditLog, User } from "@/models"
import ApiError from "@/utils/ApiError";
import httpStatus from "http-status";
import bcrypt from 'bcryptjs';

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
      query = { roles:{ $in: ['Master']} };
      break;
    case 'Master':
      query = { roles:{ $in: ['Agent']} };
      break;
    case 'Agent':
      query = { roles:{ $in: ['User']} };
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
    roles: roles!=""? [roles]:["User"],
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

const updateStatus = async (userData: any, password: string, status: string, userId: string): Promise<void> => {
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
    found.status = status;
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

export {
  findDownline,
  Register,
  myDownline,
  addCreditLog,
  getCreditLog,
  updateStatus,
  search
}