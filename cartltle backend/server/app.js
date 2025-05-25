const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

const DB = process.env.DB_CONNECTION_STRING;

// Import the Ride model FIRST
const Ride = require("./models/ride"); // Import your Ride model

// Importing the routes (import after Ride model)
const authRouter = require("./routes/auth");
const dlVerificationRouter = require("./routes/dlVerification");
const rcRouter = require("./routes/rcVerification");
const fuelPriceRouter = require("./routes/fuelPrice");
const distanceMatrixRouter = require("./routes/distanceMatrix");
const rideRouter = require("./routes/ride");
const costCalculatorRouter = require("./routes/costCalculator");
const cloudinaryRouter = require("./routes/cloudinary");
const setupSocket = require("./socket/socket");
const messagesRoutes = require("./routes/messagesRoutes");
const paymentRoute = require('./routes/paymentRoute');
const profileRouter = require("./routes/profile");


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
app.use('/fuelPrice', fuelPriceRouter);
app.use('/distanceMatrix', distanceMatrixRouter);
app.use(rideRouter);
app.use('/calculate-cost', costCalculatorRouter);
app.use(cloudinaryRouter);
app.use("/messages", messagesRoutes);
app.use('/', paymentRoute);
app.use(profileRouter);


// Connect to MongoDB
async function connectToDatabase() {
    try {
        await mongoose.connect(DB); // useNewUrlParser and useUnifiedTopology are no longer needed
        console.log("Connected to MongoDB");

    await Ride.ensureIndexes(); // Now Ride is defined
} catch (error) {
console.error("Error connecting to MongoDB:", error);
process.exit(1);
}
}

connectToDatabase();

setupSocket(server);

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => // Use server.listen for HTTP server
 console.log(`Server running on port ${PORT}`)
);