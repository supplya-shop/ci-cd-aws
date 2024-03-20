const express = require("express");
const app = express();
const expressWinston = require("express-winston");
const { createLogger, transports, format, printf } = require("winston");

// const { combine, timestamp, printf } = winston.format;
// require("winston-mongodb"); // to use: npm i winston-mongodb

// const logger = winston.createLogger({
//   level: process.env.LOG_LEVEL || "info",
//   format: winston.format.json(),
//   transports: [
//     new winston.transports.Console(),
//     new winston.transports.File({
//       filename: "./logs/app.log",
//       level: "error",
//     }),
//   ],
// });

// const logger = createLogger({
//   transports: [
//     new transports.Console(),
//     new transports.File({
//       filename: "./logs/info.log",
//       level: "info",
//     }),
//     new transports.File({
//       filename: "./logs/error.log",
//       level: "error",
//     }),
//   ],
//   // new transports.MongoDB({
//   //   db: process.env.MONGO_URL,
//   //   collection: "logs",
//   // }),
//   format: format.combine(
//     format.json(),
//     format.timestamp(),
//     format.prettyPrint()
//   ),
// });

// const myFormat = format.printf(({ level, meta, timestamp }) => {
//   return `${timestamp} ${level}: ${meta.message}`;
// });

// const logger2 = app.use(
//   expressWinston.errorLogger({
//     transports: [
//       new transports.File({
//         filename: "./logs/logsInternalErrors.log",
//       }),
//     ],
//     format: format.combine(format.json(), format.timestamp(), myFormat),
//   })
// );

// module.exports = logger;
