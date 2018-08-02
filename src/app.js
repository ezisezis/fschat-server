const config = require("./configuration.js");
const logger = require("./logger");
const app = require("express")();
const port = config.port || 8080;

app.get("/", (req, res) => res.send("Hey"));

app.use((err, req, res, next) => {
  logger.error("Unknown error", err);
  res.status(500).json({
    message: "Internal server error",
    error: err.message
  });
});

app.listen(port, () => logger.info(`Running on localhost:${port}`));
