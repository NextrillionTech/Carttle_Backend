require("dotenv").config();
const express = require("express");
const axios = require("axios");
const router = express.Router();

// API endpoint to calculate distance
router.post("/", async (req, res) => {
    try {
        const { origin, destination } = req.body;

        // Check if origin and destination are provided
        if (!origin || !destination) {
            return res.status(400).json({ error: "Please provide both origin and destination" });
        }

        const apiKey = process.env.DISTANCEMATRIX_KEY;  // Store your API key in an .env file
        const apiUrl = `https://api.distancematrix.ai/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${apiKey}`;
        // Fetch distance from Distance Matrix API
        const response = await axios.get(apiUrl);

        // Check if the API returned a valid response
        if (response.data.status === "OK") {
            const distanceText = response.data.rows[0].elements[0].distance.text;
            return res.json({ distance: distanceText });
        } else {
            return res.status(500).json({ error: "Error in fetching distance" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;