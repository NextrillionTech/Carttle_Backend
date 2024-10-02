const express = require("express");
const axios = require("axios"); 
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { state, origin, destination } = req.body;

    if (!state || !origin || !destination) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const fuelPriceResponse = await axios.post("http://localhost:3000/fuelPrice", { state });
    const fuelPrice = fuelPriceResponse.data.petrolPrice;

    if (!fuelPrice || isNaN(fuelPrice)) {
      return res.status(500).json({ message: "Invalid fuel price" });
    }

    const distanceMatrixResponse = await axios.post("http://localhost:3000/distanceMatrix", {
      origin,
      destination,
    });
    let distance = distanceMatrixResponse.data.distance; 

    if (distance.includes("km")) {
      distance = parseFloat(distance.replace(" km", ""));
    }

    if (!distance || isNaN(distance)) {
      return res.status(500).json({ message: "Invalid distance value" });
    }

    const averageMileage = 10; 
    const litersUsed = distance / averageMileage;
    const totalCost = (litersUsed * fuelPrice)/4;

    res.json({
      fuelPrice,
      distance: `${distance} km`, 
      totalCost: totalCost.toFixed(2), 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while calculating the cost" });
  }
});

module.exports = router;
