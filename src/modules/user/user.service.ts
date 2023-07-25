import { CreditLog, User } from "@/models"
import ApiError from "@/utils/ApiError";
import httpStatus from "http-status";
import bcrypt from 'bcryptjs';

const findMaxRole = async(rolesArray: any): Promise<string> => {
  const rolesOrder = ['Admin', 'White Label', 'Super', 'Master', 'Agent', 'User'];

  // Find the maximum role
  const maxRole = rolesArray.reduce((max: string, currentRole: string) => {
    const maxIndex = rolesOrder.indexOf(max);
    const currentIndex = rolesOrder.indexOf(currentRole);
    return currentIndex > maxIndex ? currentRole : max;
  }, rolesOrder[0]);

  return maxRole;
}

const findDownline = async (data: any, id: string): Promise<void> => {

  if (!data.roles) {
     throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: "role not found",
    }); 
  }

  if (id) {
    const users: any = await User.find({parentId:id});
    return users;
  }
    const maxRole = await findMaxRole(data.roles);
    let query = {};

    // Apply conditions based on the highest role
    switch (maxRole) {
      case 'Admin':
        // Admin can see all users, so no additional conditions needed
        break;
      case 'White Label':
        // White Label role can see only users with role 'Supper', 'Master', 'Agent', and 'User'
        query = { roles: 'Supper' };
        break;
      case 'Super':
        // Super roles can see only users with roles 'Master', 'Agent', and 'User'
        query = { roles: 'Master' };
        break;
      case 'Master':
        // Master roles can see only users with roles 'Agent' and 'User'
        query = { roles: 'Agent' };
        break;
      case 'Agent':
        // Agent role can see only users with role 'User'
        query = { roles: 'User' };
        break;
      case 'User':
        // Users can see only themselves (assuming there's a field 'userId' in the document)
        query = { roles: [] };
        break;
      default:
        // For unknown roles, don't fetch any data
        query = { _id: null };
    }

    // Fetch users based on the role-specific query
    const users: any = await User.find(query);
    return users;
}
  
const Register = async (body: any,user:any): Promise<void> => {
  const{username,password,mobile,ip,exposure,commision}=body
  const duplicate = await User.findOne({ username: username });
  if(duplicate){
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
      roles: ['User'],
      exposureLimit: exposure,
      commision: commision,
      parentId: user.id
    });
  return;
}

const myDownline = async (user: any): Promise<void> => {
  const users: any = await User.find({parentId:user.id});
  return users;  
}

const addCreditLog = async (userData: any,password:string, rate:number): Promise<void> => {   
  let user:any = await User.findOne({username:userData.username})
  if (!(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: "wrong password",
    });
  }

  await CreditLog.create({
    username:user.username,
    old: user?.balance,
    new: rate
  });
  user.balance = rate;
  await user.save();  
  return user;
}

const getCreditLog = async (user: any): Promise<void> => {
  
  const data = await CreditLog.find({ username: user.username })
  return data;
}


export {
  findDownline,
  Register,
  myDownline,
  addCreditLog,
  getCreditLog
}