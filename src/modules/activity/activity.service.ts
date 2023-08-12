import { Activity, User } from "@/models"
import ApiError from "@/utils/ApiError";
import httpStatus from "http-status";
import * as userService from "@/modules/user/user.service";

const fetchActivity = async (data: any, userId: string): Promise<void> => {
  let username = data.username
  try {
    if (userId) {
      const userData: any = await userService.checkParent(userId, data._id);
      username = userData.username
    }
    const response = await Activity.find({ username });
    const resp: any = { data:response, username };
    return resp;

  } catch (error:any) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: error?.errorData?.msg ||"invalid user id.",
    });
  }
}

export { fetchActivity }