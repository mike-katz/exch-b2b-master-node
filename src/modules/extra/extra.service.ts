import { User } from "@/models"
import ApiError from "@/utils/ApiError";
import httpStatus from "http-status";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
const serviceAccount = require('@/config/test-pro-e8d5a-2ebe09c66097.json');

initializeApp({
  credential: cert(serviceAccount),
});

const saveNewsFirebase = (data: any) => {
  console.log("data",data);
  
  try {
    const db = getFirestore();
    if (data.userId && data.userId !== "") db.collection('news').doc(data.userId).set(data);
  }
  catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: "Something went wrong in firebase.",
    });
  }
}

const saveNews = async (userData: any, origin: any, news: string): Promise<void> => {
  try {
    const timestamp =new Date();
          timestamp.toUTCString();
    if (userData.roles.includes("WhiteLabel")) {
      saveNewsFirebase({ userId: userData?._id.toString(), origin: userData.origin, news, date:timestamp })
    }
    if (userData.roles.includes("Admin")) {
      const filter: any = {
        roles: { $in: ['WhiteLabel'] }
      }
      if (origin && origin.length > 0) {
        filter.origin = { $in: origin }
      }
      const users: any = await User.find(filter)
      if (users && users.length > 0) {
        users.map((item: any) => {
          saveNewsFirebase({userId:item?._id.toString(), origin: item?.origin, news, date:timestamp })
        })
      }
    }
    return;
  } catch (error) {
    console.log("error",error);
    
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: "Something went wrong in firebase.",
    });
  }
}


export { saveNews }