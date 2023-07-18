import moment from "moment";
import winston, { createLogger, format, transports } from "winston";

import config from "./config";

const enumerateErrorFormat = winston.format(info => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});
const logTransports = [
  new transports.File({
    level: "error",
    filename: `./logs/${moment().format(
      "DD-MMM-YYYY"
    )}/Activity-${moment().format("hha")}.log`,
    format: format.json({
      replacer: (key, value: unknown) => {
        if (key === "error") {
          return {
            message: (value as Error).message,
            stack: (value as Error).stack,
          };
        }
        return value;
      },
    }),
  }),
  new transports.Console({
    level: "debug",
    format: winston.format.combine(
      enumerateErrorFormat(),
      config.env === "development"
        ? winston.format.colorize()
        : winston.format.uncolorize(),
      winston.format.splat(),
      winston.format.printf(
        ({ level, message }) => `${level}: ${message as string}`
      )
    ),
  }),
  new transports.File({
    level: "info",
    filename: `./logs/${moment().format(
      "DD-MMM-YYYY"
    )}/Activity-${moment().format("hha")}.log`,
    format: format.prettyPrint(),
  }),
];

const logger = createLogger({
  format: format.combine(format.timestamp()),
  transports: logTransports,
  defaultMeta: { service: "api" },
});

export default logger;
