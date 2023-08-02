import { Activity } from "@/models"

const bettingHistory = async (data: any, type: string, from: string, to: string, status: string): Promise<void> => Activity.find({ username: data.username });

const profitLoss = async (data: any, type: string, from: string, to: string): Promise<void> => Activity.find({ username: data.username });

const transaction = async (data: any): Promise<void> => Activity.find({ username: data.username });

export {
  bettingHistory,
  profitLoss,
  transaction
}