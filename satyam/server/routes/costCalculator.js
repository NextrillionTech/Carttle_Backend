const express = require("express");
const axios = require("axios");
const router = express.Router();

// Route to handle cost calculation
router.post("/", async (req, res) => {
  console.log("Cost calculator route hit");
  try {
    const { state, origin, destination } = req.body;

    // Initialize an array to collect missing fields
    const missingFields = [];

    // Check for required fields
    if (!state) {
      missingFields.push("state");
    }
    if (!origin) {
      missingFields.push("origin");
    }
    if (!destination) {
      missingFields.push("destination");
    }

    // If there are missing fields, return an error message
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Fetch fuel price from the backend
    const fuelPriceResponse = await axios.post(
      "http://localhost:3000/fuelPrice", // Use the correct URL if hosted elsewhere
      { state }
    );
    const fuelPrice = fuelPriceResponse.data.petrolPrice;

    // Validate fuel price
    if (!fuelPrice || isNaN(fuelPrice)) {
      return res.status(500).json({ message: "Invalid fuel price" });
    }

    // Fetch distance from the backend
    const distanceMatrixResponse = await axios.post(
      "http://localhost:3000/distanceMatrix", // Use the correct URL if hosted elsewhere
      { origin, destination }
    );
    let distance = distanceMatrixResponse.data.distance;

    // Remove " km" and convert the distance to a number
    if (distance.includes("km")) {
      distance = parseFloat(distance.replace(" km", ""));
    }

    // Validate distance
    if (!distance || isNaN(distance)) {
      return res.status(500).json({ message: "Invalid distance value" });
    }

    // Calculate total fuel cost
    const averageMileage = 10; // 10 km per liter mileage assumption
    const litersUsed = distance / averageMileage;
    const totalCost = (litersUsed * fuelPrice).toFixed(2); // Format to two decimal places

    // Return the result
    res.json({
      fuelPrice,
      distance: `${distance} km`, // Send the distance back in km
      totalCost, // Send the total cost
    });
  } catch (error) {
    console.error("Error calculating fuel cost:", error);
    res
      .status(500)
      .json({ message: "An error occurred while calculating the cost" });
  }
});

module.exports = router;
