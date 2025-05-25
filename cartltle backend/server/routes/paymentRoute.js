const express = require('express');
const payment_route = express();
const Razorpay = require('razorpay'); 


const bodyParser = require('body-parser');
payment_route.use(bodyParser.json());
payment_route.use(bodyParser.urlencoded({ extended: false }));

// Import the payment controller
const paymentController = require('../controllers/paymentController');

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_ID_KEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY
});

// Function to create a contact for the driver
async function createDriverContact(driverInfo) {
    const contactData = {
        name: driverInfo.name,
        email: driverInfo.email,
        contact: driverInfo.phone,
        type: 'employee',
        reference_id: driverInfo.driver_id,
    };
    
    const response = await axios.post(
        'https://api.razorpay.com/v1/contacts',
        contactData,
        {
            auth: {
                username: process.env.RAZORPAY_ID_KEY,
                password: process.env.RAZORPAY_SECRET_KEY
            }
        }
    );
    return response.data.id; // contact_id
}

// Function to create a fund account for the driver's UPI
async function createFundAccount(contactId, upiId) {
    const fundAccountData = {
        contact_id: contactId,
        account_type: 'vpa',
        vpa: {
            address: upiId // Driver's UPI ID
        }
    };

    const response = await axios.post(
        'https://api.razorpay.com/v1/fund_accounts',
        fundAccountData,
        {
            auth: {
                username: process.env.RAZORPAY_ID_KEY,
                password: process.env.RAZORPAY_SECRET_KEY
            }
        }
    );
    return response.data.id; // fund_account_id
}

// Function to make the payout to the driver
async function createPayout(fundAccountId, amount) {
    const payoutData = {
        account_number: "YourVirtualAccountNumber", // Use your Razorpay Virtual Account Number
        fund_account_id: fundAccountId,
        amount: amount * 100, // amount in paisa (for Rs 100, you pass 10000)
        currency: 'INR',
        mode: 'UPI',
        purpose: 'payout',
        queue_if_low_balance: true,
        reference_id: 'unique_payout_reference',
        narration: 'Driver Trip Payment'
    };

    const response = await axios.post(
        'https://api.razorpay.com/v1/payouts',
        payoutData,
        {
            auth: {
                username: process.env.RAZORPAY_ID_KEY,
                password: process.env.RAZORPAY_SECRET_KEY
            }
        }
    );
    return response.data;
}

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
