// setup a winston logger
import winston from "winston";
import path from "path";

const { format, transports } = winston;
const { combine, colorize, timestamp, label, printf } = format;

// set default log level
const logLevel = process.env.LOG_LEVEL || "info";

const logFormat = format.printf(
  (info) => `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`
);

const logger = winston.createLogger({
  level: "debug",
  format: winston.format.json(),
});

logger.add(
  new winston.transports.Console({
    level: logLevel,
    format: format.combine(
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      printf((info) => `[${info.level}]: ${JSON.stringify(info.message)}`)
    ),
    transports: [
      new transports.Console({
        format: format.combine(format.colorize(), logFormat),
      }),
    ],
  })
);

// logger.add(new winston.transports.File({ filename: "combined.log" }));

export { logger };
