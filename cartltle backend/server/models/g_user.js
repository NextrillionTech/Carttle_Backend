const mongoose = require("mongoose");

const g_userSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        trim: true, // Trim white spaces
    },
    name: {
        type: String,
        required: true,
        trim: true, // Trim white spaces
    },
    email: {
        type: String,
        required: true,
        trim: true, // Trim white spaces
        unique: true, // Ensure email is unique
        match: [/\S+@\S+\.\S+/, 'Please enter a valid email address'], // Basic email validation
    },
});

const G_User = mongoose.model("G_User", g_userSchema);
module.exports = G_User;
