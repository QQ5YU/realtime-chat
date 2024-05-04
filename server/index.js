const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const UserModel = require("./models/User");
const app = express();
dotenv.config();

const mongoURL = process.env.SERVER_MONGODB_URL || "not found";
const jwtSecret = process.env.SERVER_JWT_SECRET || "not found";

mongoose.connect(mongoURL).then(() => console.log("connected to MongoDB"));

app.get("/", (req, res) => {
  res.json("get ok");
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const newUser = await UserModel.create({ username, password });
  console.log(username, password);
  jwt.sign({ userId: newUser._id }, jwtSecret, (err, token) => {
    if (err) throw err;
    res.cookie("token", token).status(201).json("ok");
  });
});

app.listen(4000, () => {
  console.log("listening on port 4000");
});
