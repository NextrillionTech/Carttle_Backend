const Razorpay = require('razorpay'); 
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

// Initialize Razorpay instance
const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_ID_KEY,
    key_secret: RAZORPAY_SECRET_KEY
});

// API to create a trip payment order
const createTripOrder = async (req, res) => {
    try {
        // Calculate the amount (e.g., for a trip cost)
        const amount = req.body.amount * 100; // Razorpay expects amount in paise (1 INR = 100 paise)

        // Options for creating the order
        const options = {
            amount: amount, // in paise
            currency: 'INR',
            receipt: `trip_${req.body.tripId}`, // Assign a unique receipt ID based on tripId
            payment_capture: 1 // Automatically capture the payment
        };

        // Create the order in Razorpay
        razorpayInstance.orders.create(options, (err, order) => {
            if (!err) {
                res.status(200).send({
                    success: true,
                    msg: 'Order Created',
                    order_id: order.id,
                    amount: amount,
                    key_id: RAZORPAY_ID_KEY,
                    tripId: req.body.tripId, // Pass the tripId for reference
                    description: req.body.description,
                    contact: req.body.contact, // User contact
                    name: req.body.name, // User's name
                    email: req.body.email // User's email
                });
            } else {
                res.status(400).send({ success: false, msg: 'Error creating order' });
            }
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ success: false, msg: 'Server error' });
    }
};

// API to handle payment callback from Razorpay
const handlePaymentCallback = async (req, res) => {
    try {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

        // Verify the payment signature to ensure its validity
        const generatedSignature = crypto.createHmac('sha256', RAZORPAY_SECRET_KEY)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest('hex');

        if (generatedSignature === razorpay_signature) {
            // Payment is verified successfully, proceed with updating the trip payment status
            res.status(200).send({ success: true, msg: 'Payment successful' });
        } else {
            res.status(400).send({ success: false, msg: 'Invalid payment signature' });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ success: false, msg: 'Server error' });
    }
};

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
};

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
};

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
};


module.exports = {
    createTripOrder,
    handlePaymentCallback,
    createDriverContact,
    createFundAccount,
    createPayout
};
