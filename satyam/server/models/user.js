const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true, // Trim white spaces
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
        enum: ['driver', 'passenger'], // Restricting valid values
    },
    dlnumber: {
        type: String,
        trim: true, // Optional, no required flag
    },
    regNumber: {
        type: String,
        trim: true, // Optional, no required flag
    },
    dob: {
        type: String,
        validate: {
            validator: (value) => {
                // Validating date format as DD-MM-YYYY
                const re = /^\d{2}-\d{2}-\d{4}$/;
                return value.match(re);
            },
            message: "Please enter a valid date of birth in the format DD-MM-YYYY",
        },
    },
    email: {
        type: String,
        required: false,
        trim: true,
        validate: {
            validator: (value) => {
                const re =
                    /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
                return value.match(re);
            },
            message: "Please enter a valid email address",
        },
    },
    gender: {
        type: String,
        required: false,
    },
    about_yourself: {
        type: String,
        required: false,
    },
    drive_speed: {
        type: String,
        required: false,
    },
    music_taste: {
        type: String,
        required: false,
    },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
