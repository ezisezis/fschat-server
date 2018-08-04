const config = require("./configuration.js");
const logger = require("./logger");
const utilities = require("./utilities");

const escapeHtml = require("escape-html");
const http = require("http");
const app = require("express")();
const NodeCache = require("node-cache");
const server = http.createServer(app);
const io = require("socket.io")(server);
const port = config.port || 8080;
const connectedUsersCache = new NodeCache({
  stdTTL: config.cache.userConnectionTTL,
  checkperiod: config.cache.checkperiod
});

server.listen(port, () => logger.info(`Running on port ${port}`));

const handleDisconnect = (socket, reason) => {
  logger.info("User connection attempt failed", { reason });
  socket.emit("connect_failed", { reason });
  socket.disconnect(true);
};

io.on("connection", socket => {
  const username = escapeHtml(socket.handshake.query.username);
  if (!utilities.isUsernameValid(username)) {
    handleDisconnect(socket, "INVALID_USERNAME");
  } else if (!socket.handshake.query.username) {
    handleDisconnect(socket, "NO_USERNAME");
  } else if (connectedUsersCache.get(`${socket.id}__${username}`)) {
    handleDisconnect(socket, "ID_TAKEN");
  } else if (utilities.isUsernameTaken(connectedUsersCache.keys(), username)) {
    handleDisconnect(socket, "USERNAME_TAKEN");
  } else {
    connectedUsersCache.set(`${socket.id}__${username}`, {
      username,
      id: socket.id
    });
    logger.info("User connected", { username });
    socket.emit("connect_success");
    socket.broadcast.emit("user_joined", { username });
  }

  socket.on("message", data => {
    connectedUsersCache.ttl(
      `${socket.id}__${username}`,
      config.cache.userConnectionTTL,
      (err, changed) => {
        if (err || !changed) {
          logger.error("Failed to update TTL", { socketID: socket.id });
        }
      }
    );

    const escapedMessage = {
      username: escapeHtml(data.username),
      message: escapeHtml(data.message)
    };
    logger.info("Message received", {
      content: escapedMessage.message,
      username: escapedMessage.username
    });
    socket.broadcast.emit("message", escapedMessage);
  });

  socket.on("disconnect", () => {
    const disconnectedUser = connectedUsersCache.get(
      `${socket.id}__${username}`
    );
    if (disconnectedUser) {
      logger.info("User left the chat", {
        username: disconnectedUser.username
      });
      socket.broadcast.emit("message", {
        message: `${disconnectedUser.username} left the chat, connection lost.`
      });

      connectedUsersCache.del(`${socket.id}__${username}`);
    }
  });
});

connectedUsersCache.on("expired", (key, value) => {
  logger.info("Kicked due to inactivity", { username: value.username });
  io.to(value.id).emit("kicked_inactive");
  io.emit("message", {
    message: `${value.username} was disconnected due to inactivity.`
  });
});

process.on("SIGTERM", () => {
  logger.error("Got SIGTERM, shutting down...");
  connectedUsersCache.close();
  io.close(() => process.exit());
});

process.on("SIGINT", () => {
  logger.error("Got SIGINT, shutting down...");
  connectedUsersCache.close();
  io.close(() => process.exit());
});
