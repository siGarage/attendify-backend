import { createLogger, format, transports } from "winston";
import DailyRotateFile  from "winston-daily-rotate-file";
const { combine, timestamp, json, colorize, splat } = format;

const consoleLogFormat = format.combine(
  format.colorize(),
  format.printf(({ timestamp, level, message }) => {
    return `${timestamp}:Level:${level}-Message${message}`;
  })
);

const logger = createLogger({
  level: "debug",
  format: combine(colorize(), splat(), timestamp(), consoleLogFormat),
  transports: [
    new transports.Console({
      format: consoleLogFormat,
    }),
    new DailyRotateFile({
      filename: 'app-%DATE%.log', 
      datePattern: 'YYYY-MM-DD', 
      maxSize: '20m', // Rotate after 20MB
      maxFiles: '60d' // Keep logs for 60 days (approximately 2 months)
    })
  ],
});

export default logger;
