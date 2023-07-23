import { Activity } from "@/models"

const fetchActivity = async (data:any): Promise<void> => Activity.find({ username:data.username });

export {
  fetchActivity,
}