const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); // Import cors

const app = express();
const DB =
  "mongodb+srv://skanoujia9:cartle123@cluster0.hkgom.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Importing the routes
const authRouter = require("./routes/auth");

// Enable CORS (Allow access from anywhere)
app.use(
  cors({
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
    credentials: true, // Allow cookies and authorization headers
  })
);

// Use JSON parser middleware
app.use(express.json());

// Add your routes
app.use(authRouter);

// Connect to MongoDB
mongoose
  .connect(DB)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

// Start the server
app.listen(3000, "0.0.0.0", () => console.log("Server running on port 3000"));
