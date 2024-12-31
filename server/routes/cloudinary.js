const cloudinary = require('./cloudinaryConfig'); 
const express = require("express");

const router = express.Router();


router.get('/search-car-image', async (req, res) => {
  const { carName } = req.query;  
  if (!carName) {
    return res.status(400).json({ error: 'Car name is required' });
  }

  try {
    const imageUrl = cloudinary.url(carName, {
      width: 400,
      height: 300,
      crop: 'fit'
    });

    return res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('Error retrieving image:', error);
    return res.status(500).json({ error: 'Failed to retrieve image from Cloudinary' });
  }
});

module.exports = router;
