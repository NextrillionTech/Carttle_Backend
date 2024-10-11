const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const DB = process.env.DB_CONNECTION_STRING;

// Importing the routes
const authRouter = require("./routes/auth");
const dlVerificationRouter = require("./routes/dlVerification");
const rcRouter = require("./routes/rcVerification");
const fuelPriceRouter = require("./routes/fuelPrice");
const distanceMatrixRouter = require("./routes/distanceMatrix");
const rideRouter = require("./routes/ride");
const costCalculatorRouter = require("./routes/costCalculator");
const tripRouter = require("./routes/trip");
const cloudinaryRouter = require("./routes/cloudinary");
const { default: setupSocket } = require("./socket/socket");
const { default: messagesRoutes } = require("./routes/messagesRoutes");

 
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
app.use('/auth', authRouter);
app.use('/verify-dl', dlVerificationRouter);
app.use(rcRouter);
app.use('/fuelPrice',fuelPriceRouter);
app.use('/distanceMatrix',distanceMatrixRouter);
app.use(rideRouter);
app.use('/calculate-cost', costCalculatorRouter);
app.use(tripRouter);
app.use(cloudinaryRouter);
app.use("/messages",messagesRoutes)

// Connect to MongoDB
mongoose
  .connect(DB)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
);

setupSocket(server);