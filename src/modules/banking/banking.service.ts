import { CreditLog, Transcation, B2cBankingLog, User } from "@/models"
import ApiError from "@/utils/ApiError";
import httpStatus from "http-status";


const saveTransaction = async (userData: any, password: string, data: any): Promise<string> => {
  const user: any = await User.findOne({ username: userData.username })
  if (!(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: "wrong password",
    });
  }
  let userBalance: number = parseFloat(user.balance.toString()) || 0;
  let transcationData: any = [];
  let creditLogData: any = [];
  let successfulTransactions = "";
  let failedTransactions = "";


  if (data.length > 0) {
    await Promise.all(data.map(async (item: any) => {
      const toUser: any = await User.findOne({ _id: item?.userId })
      if (!toUser) {
        failedTransactions += `, ${item.userId} not found.`;
        return; // Skip transactions with invalid toUser
      }

      if (item.type != "") {
        if (item.balance <= 0) {
          failedTransactions += `, balance 0 not allow for ${item.userId}`;
          return; // Skip transactions with non-positive balances
        }

        let toUserBalance: number = parseFloat(toUser.balance) || 0;
        const itemBalance: number = parseFloat(item.balance) || 0;
        if (item.type === "deposit") {
          if (userBalance < itemBalance) {
            failedTransactions += `, insuficinant balance for ${toUser?.username}`;
            return; // Skip transactions with insufficient balance for deposit
          }
          userBalance -= itemBalance;
          toUser.balance = toUserBalance + itemBalance;

          transcationData.push({
            sender_id:userData._id,
            receiver_id:item?.userId,
            amount: itemBalance,
            message:`${userData?.username} send amount to ${toUser?.username}`,
            method: "Deposit",
            username: userData?.username,
            balance:itemBalance,
            remark: item?.remark,
          });
          // transcationData.push({
          //   fromId: userData._id,
          //   toId: item?.userId,
          //   balance: itemBalance,
          //   type: item?.type,
          //   remark: item?.remark,
          //   newBalance:toUser.balance
          // })

          if (item?.creditRef > 0) {
            creditLogData.push({
              username: toUser?.username,
              old: toUser?.creditRef || 0,
              new: item?.creditRef || 0
            });
          toUser.creditRef = item?.creditRef;
          }

        } else if (item.type === "withdraw") {
          if (itemBalance > toUserBalance) {
            failedTransactions += `, insuficinant balance for withdraw ${toUser?.username}`;
            return; // Skip transactions with insufficient balance for withdrawal
          }
            userBalance += itemBalance;
            toUser.balance = toUserBalance - itemBalance;
          transcationData.push({
            sender_id:userData._id,
            receiver_id:item?.userId,
            amount: itemBalance,
            message:`${userData?.username} send amount to ${toUser?.username}`,
            method: "Withdraw",
            username: userData?.username,
            balance:itemBalance,
            remark: item?.remark,
          });
          // transcationData.push({
          //   fromId: userData._id,
          //   toId: item?.userId,
          //   balance: itemBalance,
          //   type: item?.type,
          //   remark: item?.remark,
          //   newBalance:toUser.balance
          // })

          if (item?.creditRef > 0) {
            creditLogData.push({
              username: toUser?.username,
              old: toUser?.creditRef || 0,
              new: item?.creditRef || 0
            });            
            toUser.creditRef = item?.creditRef;
          }
        }
      }
      else {
        // failedTransactions += `, invalid type entered ${item.type}`;
        // return; // Skip transactions with unsupported types
        if (item?.creditRef > 0) {
          creditLogData.push({
            username: toUser?.username,
            old: toUser?.creditRef || 0,
            new: item?.creditRef || 0
          });
          toUser.creditRef = item?.creditRef;
        }
      }
      await toUser.save();
      successfulTransactions += `, success with ${toUser.username}`;
    }));
  }
  user.balance = userBalance
  await user.save();
  if (transcationData.length > 0) {
    // Transcation.insertMany(transcationData)
    B2cBankingLog.insertMany(transcationData)    
  }

  if (creditLogData.length > 0) {
    CreditLog.insertMany(creditLogData)
  }

  const resp = successfulTransactions + failedTransactions;
  return resp.slice(1);
}

const getTransaction = async (userData: any, userId: string, options: any): Promise<void> => {
  try {
    let username = userData?.username;
    let filter: any = {}
    filter.fromId = userData?._id

    if (userId !== undefined && userId !== "") {
      filter.toId = userId;
      const getUsername:any = await User.findOne({ _id: userId }).select('username');
      username = getUsername?.username;
    }
    const optObj = {
      ...options,
      // path: Transcation.POPULATED_FIELDS,
      path: B2cBankingLog.POPULATED_FIELDS,
      
      sortBy: options.sortBy ? options.sortBy : "createdAt:desc",
    };

    // const data = await Transcation.paginate(filter, optObj);
    const data = await B2cBankingLog.paginate(filter, optObj);    
    const resp: any = { data, username };
    return resp;

  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      msg: "invalid user id.",
    });
  }
}

export { saveTransaction, getTransaction }