const cors = require("cors");
const express = require("express");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const UserModel = require("./models/User");
const app = express();

app.use(express.json());
app.use(cookieParser());
dotenv.config();

const whiteList = ["http://localhost:5173", "http://127.0.0.1:5173"];
const mongoURL = process.env.SERVER_MONGODB_URL || "not found";
const jwtSecret = process.env.SERVER_JWT_SECRET || "not found";
const bcryptSalt = bcrypt.genSaltSync(10);

app.use(
  cors({
    credentials: true,
    origin: whiteList,
  })
);

mongoose.connect(mongoURL).then(() => console.log("connected to MongoDB"));

app.get("/", async (req, res) => {
  await UserModel.deleteMany({});
  const data = await UserModel.find({});
  res.json(data);
});

app.get("/profile", (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    jwt.verify(token, jwtSecret, {}, (err, userData) => {
      if (err) throw err;
      const { userId } = userData;
      res.json({
        id: userId,
      });
    });
  } else res.status(401).json("no token");
});

app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashPassword = bcrypt.hashSync(password, bcryptSalt);
    const newUser = await UserModel.create({
      username: username,
      password: hashPassword,
    });
    jwt.sign({ userId: newUser._id }, jwtSecret, {}, (err, token) => {
      if (err) throw err;
      res
        .cookie("token", token, { sameSite: "none", secure: true })
        .status(201)
        .json({
          id: newUser._id,
          username: newUser.username,
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
  console.log(user);
  const authorized = bcrypt.compare(password, user.password);
  if (authorized) {
    jwt.sign({ userId: user._id }, jwtSecret, {}, (token) => {
      res
        .cookie("token", token, { sameSite: "none", secure: true })
        .status(201)
        .json({
          id: user._id,
        });
    });
  }
});

app.listen(4000, () => {
  console.log("listening on port 4000");
});
