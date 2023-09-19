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
  try {
    const db = getFirestore();
    if (data.origin && data.origin !== "") {
      var replacedString = data.origin.replace(/[^a-zA-Z0-9]/g, '-');
      db.collection('news').doc(replacedString).set(data);
    } 
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
      saveNewsFirebase({ origin: userData.origin, news, date:timestamp })
    }
    if (userData.roles.includes("Admin")) {
      if (origin === "" && news === "") {
        
      }
      const filter: any = {
        roles: { $in: ['WhiteLabel'] }
      }
      if (origin && origin.length > 0) {
        filter.origin = origin 
      }
      const users: any = await User.find(filter)
      if (users && users.length > 0) {
        users.map((item: any) => {
          saveNewsFirebase({ origin: item?.origin, news, date:timestamp })
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