const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({

    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: false,
    },
    messageType: {
        type: String,
        enum: ["text"],
        required: true,
    },
    content: {
        type: String,
        required: function () {
            return this.messageType === "text";
        },
    },
    timestamp:{
        type: Date,
        default:Date.now,
    },
});

const Message = mongoose.model("Message",messageSchema);

module.exports = Message;