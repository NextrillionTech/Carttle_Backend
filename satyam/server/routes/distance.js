const axios = require('axios');

async function calculateDistance() {
    try {
        const apiKey = "HJdfGdfS3PdJkaVcIM7jLcANs0MGBBQ3aIH7xtOW670gwnXuCTDRnvYzyuEggpUSg";
        const originAddress = "Sigra, Varanasi, Uttar Pradesh";
        const destinationAddress = "Madanpura, Varanasi, Uttar Pradesh";
        const apiUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${originAddress}&destinations=${destinationAddress}&key=${apiKey}`;

        const response = await axios.get(apiUrl);
        console.log(response.data);
        console.log(response.data.rows[0].elements);
    } catch (error) {
        console.log(error);
    }
}

calculateDistance();