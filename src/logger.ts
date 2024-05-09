import log4js from "log4js";

log4js.configure({
  appenders: {
    out: {
      type: "stdout",
      layout: { type: "colored" },
    },
    logFile: {
      type: "dateFile",
      filename: "logs/log/log.log",
      pattern: ".yyyy-MM-dd",
      numBuckups: 30,
      compress: true,
      keepFileExt: true,
    },
    errFile: {
      type: "dateFile",
      filename: "logs/err/err.log",
      pattern: ".yyyy-MM-dd",
      numBuckups: 30,
      compress: true,
      keepFileExt: true,
    },
    flog: {
      type: "logLevelFilter",
      appender: ["logFile"],
      level: "info",
    },
    ferr: {
      type: "logLevelFilter",
      appender: ["errFile"],
      level: "warn",
    },
  },
  categories: {
    default: { appenders: ["out", "flog", "ferr"], level: "all" },
  },
});

export default log4js.getLogger();
