const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true, 
    },
    phonenumber: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: (value) => {
                const re = /^\d{10}$/; 
                return value.match(re);
            },
            message: "Please enter a valid 10-digit phone number",
        },
    },
    password: {
        type: String,
        required: true,
    },
    is_driver: {
        type: Boolean,
        required: true, 
    },    
    dlnumber: {
        type: String,
        trim: true, 
    },
    regNumber: {
        type: String,
        trim: true, 
    },
    dob: {
        type: String,
        validate: {
            validator: (value) => {
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
        enum: ['Male', 'Female'], 
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
    profile_pic: {
        type: String,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const User = mongoose.model("User", userSchema);
module.exports = User;
