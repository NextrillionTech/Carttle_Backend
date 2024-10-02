const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true, // trim white spaces
    },
    phonenumber: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: (value) => {
                const re = /^\d{10}$/; // Regex for 10-digit phone number
                return value.match(re);
            },
            message: "Please enter a valid 10-digit phone number",
        },
    },
    password: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    }
});

const User = mongoose.model("User", userSchema);
module.exports = User;
