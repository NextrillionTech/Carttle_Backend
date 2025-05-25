const express = require('express');
const https = require('https');
const router = express.Router();

router.post('/', async (req, res) => {
  const { state } = req.body;

  const options = {
    method: 'GET',
    hostname: 'daily-petrol-diesel-lpg-cng-fuel-prices-in-india.p.rapidapi.com',
    port: null,
    path: `/v1/fuel-prices/today/india/${state}`,
    headers: {
      'x-rapidapi-key': process.env.RAPIDAPI_KEY,
      'x-rapidapi-host': 'daily-petrol-diesel-lpg-cng-fuel-prices-in-india.p.rapidapi.com',
    },
  };

  const request = https.request(options, (response) => {
    let chunks = [];

    response.on('data', (chunk) => {
      chunks.push(chunk);
    });

    response.on('end', () => {
      const body = Buffer.concat(chunks).toString();

      // Try to parse the response as JSON
      try {
        const data = JSON.parse(body);

        // Extract only the petrol price and send it to the frontend
        const petrolPrice = data.fuel.petrol.retailPrice;
        res.json({ petrolPrice }); // Send the petrol price as the response
      } catch (error) {
        res.status(500).json({ message: 'Failed to parse response from API' });
      }
    });
  });

  request.on('error', (error) => {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch fuel prices' });
  });

  request.end();
});

module.exports = router;
