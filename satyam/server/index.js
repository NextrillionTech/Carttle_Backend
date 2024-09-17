const express = require("express");
const mongoose = require("mongoose");

const app = express();
const DB = "mongodb+srv://skanoujia9:cartle123@cluster0.hkgom.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const authRouter = require("./routes/auth");


app.use(express.json());
app.use(authRouter);

mongoose
  .connect(DB)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));


app.listen(3000, "0.0.0.0", () => console.log("Server running on port 3000"));

