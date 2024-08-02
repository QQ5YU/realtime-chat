const cors = require("cors");
const express = require("express");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const UserModel = require("./models/User");
const MessageModel = require("./models/Message");
const createWsServer = require("./wss");
const path = require("path");

const app = express();
const port = process.env.PORT || 4000;
const mongoURL = process.env.SERVER_MONGODB_URL || "not found";
const jwtSecret = process.env.SERVER_JWT_SECRET || "not found";
const bcryptSalt = bcrypt.genSaltSync(10);
const whiteList = ["http://localhost:5173", "http://127.0.0.1:5173"];

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: whiteList,
  })
);
dotenv.config();

mongoose.connect(mongoURL).then(() => console.log("connected to MongoDB"));

function getUserDataFromRequest(req) {
  return new Promise((resolve, reject) => {
    const token = req.cookies?.token;
    if (token) {
      jwt.verify(token, jwtSecret, {}, (err, userData) => {
        if (err) throw err;
        resolve(userData);
      });
    } else reject("no token");
  });
}

app.get("/", async (req, res) => {
  const data = await UserModel.find({});
  res.json(data);
});

app.get("/profile", async (req, res) => {
  try {
    const userData = await getUserDataFromRequest(req);
    res.status(201).json(userData);
  } catch (err) {
    res.status(401).json("no token");
  }
});

app.get("/messages/:userId", async (req, res) => {
  const { userId } = req.params;
  const userData = await getUserDataFromRequest(req);
  const ourUserId = userData.userId;
  const messages = await MessageModel.find({
    sender: { $in: [userId, ourUserId] },
    recipient: { $in: [userId, ourUserId] },
  }).sort({ createdAt: 1 });
  res.json(messages);
});

app.get("/users", async (req, res) => {
  const users = await UserModel.find({}, { _id: 1, username: 1 });
  res.json(users);
});

app.get("/deleteMsg", async (req, res) => {
  await MessageModel.deleteMany({}).then(() => {
    res.status(200).send("delete all msgs");
  });
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashPassword = bcrypt.hashSync(password, bcryptSalt);
    const newUser = await UserModel.create({
      username: username,
      password: hashPassword,
    });
    jwt.sign({ userId: newUser._id, username }, jwtSecret, {}, (err, token) => {
      if (err) throw err;
      res
        .cookie("token", token, { sameSite: "none", secure: true })
        .status(201)
        .json({
          id: newUser._id,
        });
    });
  } catch (e) {
    if (e) throw e;
    res.status(500).json("error");
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await UserModel.findOne({ username });
  if (user) {
    const authorized = bcrypt.compare(password, user.password);
    if (authorized) {
      jwt.sign({ userId: user._id, username }, jwtSecret, {}, (err, token) => {
        res
          .cookie("token", token, { sameSite: "none", secure: true })
          .status(201)
          .json({
            id: user._id,
            username: username,
          });
      });
    }
  }
});

app.post("/logout", async (req, res) => {
  res
    .status(200)
    .cookie("token", "", { sameSite: "none", secure: true })
    .json("success logout");
});

const server = app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

createWsServer(server);

module.exports = app;
