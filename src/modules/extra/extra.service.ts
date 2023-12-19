import { User } from "@/models"
import ApiError from "@/utils/ApiError";
import httpStatus from "http-status";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
const serviceAccount = require('@/config/others-67243-firebase-adminsdk-d1ydj-a6b1560d2a.json');
const { MongoClient } = require('mongodb');

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
    const timestamp = new Date();
    timestamp.toUTCString();
    if (userData.roles.includes("WhiteLabel")) {
      saveNewsFirebase({ origin: userData.origin, news, date: timestamp })
    }
    if (userData.roles.includes("Admin")) {
      if (origin === "" && news === "") {
        const db = getFirestore();
        db.collection("news").get().then((res: any) => {
          res.forEach((element: any) => {
            element.ref.delete();
          });
        });
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
          saveNewsFirebase({ origin: item?.origin, news, date: timestamp })
        })
      }
    }
    return;
  } catch (error) {
    console.log("error", error);

    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: "Something went wrong in firebase.",
    });
  }
}

const getThemes = async (origin: any): Promise<void> => {
  const uri = process.env.MONGODB_URL;
  const client:any = new MongoClient(uri);
  const cursor = await client.db(process.env.EXCH_DB).collection('themes')
      .find({ origin, type:'master' });
  const results = await cursor.toArray();
  return results
}

const getSpredexIds = async (eventId: string): Promise<string> => {
 
   try {
    const uri = process.env.MONGODB_URL;
  const client:any = new MongoClient(uri);
  const cursor = await client.db(process.env.EXCH_DB).collection('scoreboards')
    .findOne({ eventId });
  return cursor.spreadexId || '';
  } catch (err) {
     return '';
   }
  
}
export { saveNews, getThemes, getSpredexIds }