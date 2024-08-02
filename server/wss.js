const ws = require("ws");
const fs = require("fs");
const path = require("path");

module.exports = function createWsServer(server) {
  const wss = new ws.WebSocketServer({ server });

  function notifyAboutOnlineUser() {
    [...wss.clients].forEach((client) => {
      client.send(
        JSON.stringify({
          online: [...wss.clients].map((c) => ({
            userId: c.userId,
            username: c.username,
          })),
        })
      );
    });
  }

  wss.on("connection", (connection, req) => {
    connection.isAlive = true;

    connection.timer = setInterval(() => {
      connection.ping();
      connection.deathTimer = setTimeout(() => {
        connection.isAlive = false;
        clearInterval(connection.timer);
        connection.terminate();
        notifyAboutOnlineUser();
      }, 1000);
    }, 5000);

    connection.on("pong", () => {
      clearTimeout(connection.deathTimer);
    });

    // read usename and userId from this connection
    const cookies = req.headers.cookie;
    if (cookies) {
      const tokenCookieString = cookies
        .split(";")
        .find((str) => str.startsWith("token="));
      if (tokenCookieString) {
        const token = tokenCookieString.split("=")[1];
        if (token) {
          jwt.verify(token, jwtSecret, {}, (err, userData) => {
            if (err) throw err;
            const { userId, username } = userData;
            connection.userId = userId;
            connection.username = username;
          });
        }
      }
    }

    connection.on("message", async (message) => {
      const messageData = JSON.parse(message.toString());
      const { recipient, text, file } = messageData;
      let fileName = "";
      if (file) {
        const parts = file.name.split(".");
        const ext = parts[parts.length - 1];
        fileName = `${Date.now()}.${ext}`;
        const savePath = path.join(__dirname, "uploads", fileName);
        const bufferData = new Buffer.from(file.data.split(",")[1], "base64");
        fs.writeFile(savePath, bufferData, (err) => {
          if (err) {
            console.log("file saved error: " + err);
          } else console.log(`file saved at ${savePath}`);
        });
      }
      if (recipient && (text || file)) {
        const messageDoc = await MessageModel.create({
          sender: connection.userId,
          recipient,
          text,
          file: file ? fileName : null,
        });
        [...wss.clients]
          .filter((client) => client.userId === recipient)
          .forEach((client) => {
            client.send(
              JSON.stringify({
                text,
                sender: connection.userId,
                recipient,
                file: file ? fileName : null,
                id: messageDoc._id,
              })
            );
          });
      }
    });

    // notify everyone about online people when everyone connect
    notifyAboutOnlineUser();
  });
};
