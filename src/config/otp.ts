import { DurationInputArg1, DurationInputArg2 } from "moment";

interface sendOtpTimerType {
  time: DurationInputArg1 | number;
  unit: DurationInputArg2 | string;
}

interface maxOtpType extends sendOtpTimerType {
  limit: number;
}

const sendOtpTimer: sendOtpTimerType = {
  time: 30,
  unit: "seconds",
};

const maxOtpLimitAndTime: maxOtpType = {
  limit: 3,
  time: 1,
  unit: "hour",
};

enum userOtpVarification {
  PHONE = "PHONE",
  EMAIL = "EMAIL",
}

export { maxOtpLimitAndTime, sendOtpTimer, userOtpVarification };
