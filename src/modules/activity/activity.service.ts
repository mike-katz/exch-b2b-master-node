import { Activity } from "@/models"

const fetchActivity = async (username: String): Promise<void> => Activity.find({ username });

export {
  fetchActivity,
}