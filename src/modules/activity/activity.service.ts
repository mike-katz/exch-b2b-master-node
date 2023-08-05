import { Activity, User } from "@/models"
import ApiError from "@/utils/ApiError";
import httpStatus from "http-status";

const fetchActivity = async (data: any, userId: string): Promise<void> => {
  let username = data.username
  try {
    if (userId) {
      const userData: any = await User.findOne({ _id: userId });
      if (!userData) {
        throw new ApiError(httpStatus.BAD_REQUEST, {
          msg: "user not found",
        });
      }

      if (!userData.parentId == userData._id) {
        throw new ApiError(httpStatus.BAD_REQUEST, {
          msg: "you are not refered to this user.",
        });
      }
      username = userData.username
    }

    const response = await Activity.find({ username });
    return response;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: "invalid user id.",
    });
  }
}
export { fetchActivity }