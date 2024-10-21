const express = require('express');
const payment_route = express();

const bodyParser = require('body-parser');
payment_route.use(bodyParser.json());
payment_route.use(bodyParser.urlencoded({ extended: false }));

// Import the payment controller
const paymentController = require('../controllers/paymentController');

// Route to create a payment order for the trip (called from React Native app)
payment_route.post('/createTripOrder', paymentController.createTripOrder);

// Route to handle payment status (success/failure) from payment gateway
payment_route.post('/paymentCallback', paymentController.handlePaymentCallback);

payment_route.post('/transfer-to-driver', async (req, res) => {
    try {
        const { name, email, phone, driver_id, upi_id, amount } = req.body;
        
        // Step 1: Create a contact for the driver
        const contactId = await createDriverContact({ name, email, phone, driver_id });
        
        // Step 2: Create a fund account linked to the driver's UPI
        const fundAccountId = await createFundAccount(contactId, upi_id);

        // Step 3: Make the payout to the driver's UPI
        const payoutResult = await createPayout(fundAccountId, amount);

        res.status(200).json({
            success: true,
            message: 'Payout successful!',
            payoutResult
        });

    } catch (error) {
        console.error('Error processing payout:', error);
        res.status(500).json({ success: false, message: 'Something went wrong!' });
    }
});

// Export the payment route
module.exports = payment_route;
