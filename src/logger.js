const config = require("./configuration");
const { createLogger, format, transports } = require("winston");
const { existsSync } = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");

if (!existsSync(config.logging.logdir)) {
  mkdirp.sync(config.logging.logdir);
}
const logger = createLogger({
  level: config.logging.level,
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.File({
      filename: path.join(config.logging.logdir, "app.log")
    }),
    new transports.Console()
  ]
});

module.exports = logger;
