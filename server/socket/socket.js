const { Server: SocketIOServer } = require("socket.io");
const Message = require("../models/messages");
const Ride = require("../models/ride"); // Ride model for managing rides.

const setupSocket = (server) => {
    const io = new SocketIOServer(server, {
        cors: {
            origin: "*", // Allow all origins
            methods: ["GET", "POST"], // Allowed methods
            credentials: true, // Allow cookies and authorization headers
        },
    });

    const userSocketMap = new Map();

    /**
     * Handles disconnection of a socket
     * @param {Object} socket - The socket object
     */
    const disconnect = (socket) => {
        console.log(`Client Disconnected: ${socket.id}`);
        for (const [userId, socketId] of userSocketMap.entries()) {
            if (socketId === socket.id) {
                userSocketMap.delete(userId);
                console.log(`Removed user ${userId} from socket map`);
                break;
            }
        }
    };

    /**
     * Handles sending messages between users
     * @param {Object} message - Message object containing sender, recipient, and message details
     */
    const sendMessage = async (message) => {
        const { sender, recipient, text } = message;

        if (!sender || !recipient || !text) {
            console.error("Invalid message data");
            return;
        }

        try {
            const senderSocketId = userSocketMap.get(sender);
            const recipientSocketId = userSocketMap.get(recipient);

            // Create and fetch the message from the database
            const createdMessage = await Message.create(message);
            const messageData = await Message.findById(createdMessage._id)
                .populate("sender", "id email name")
                .populate("recipient", "id email name");

            // Emit the message to the recipient and sender
            if (recipientSocketId) {
                io.to(recipientSocketId).emit("receiveMessage", messageData);
            }
            if (senderSocketId) {
                io.to(senderSocketId).emit("receiveMessage", messageData);
            }
        } catch (error) {
            console.error("Error sending message:", error.message);
        }
    };

    /**
     * Handles updating the driver's current location
     * @param {Object} locationData - Contains driverId and current coordinates
     */
    const updateLocation = async (locationData) => {
        const { driverUserId, latitude, longitude } = locationData;
    
        if (!driverUserId || (!latitude && latitude !== 0) || (!longitude && longitude !== 0)) {
            console.error("Invalid location data");
            return;
        }
    
        try {
            // Find the ride for the given driver
            const ride = await Ride.findOne({ "driver.userId": driverUserId, status: "upcoming" });
    
            if (!ride) {
                console.warn(`No active ride found for driver ${driverUserId}`);
                return;
            }
    
            // Update only latitude or longitude in the `from.coordinates` array
            const updatedCoordinates = [...ride.from.coordinates]; // Clone the existing coordinates
            if (latitude !== undefined) updatedCoordinates[1] = latitude; // Update latitude (index 1)
            if (longitude !== undefined) updatedCoordinates[0] = longitude; // Update longitude (index 0)
    
            // Update the ride with the new `from.coordinates`
            ride.from.coordinates = updatedCoordinates;
            await ride.save();
    
            console.log(`Updated location for ride ${ride._id}: [${updatedCoordinates[1]}, ${updatedCoordinates[0]}]`);
        } catch (error) {
            console.error("Error updating location:", error.message);
        }
    };    

    /**
     * Handles new socket connections
     * @param {Object} socket - The socket object
     */
    io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId;

        if (userId) {
            userSocketMap.set(userId, socket.id);
            console.log(`User connected: ${userId} with socket ID: ${socket.id}`);
        } else {
            console.warn("User ID not provided during connection.");
        }

        // Event listeners for the socket
        socket.on("sendMessage", sendMessage);
        socket.on("updateLocation", updateLocation); // New event for location updates
        socket.on("disconnect", () => disconnect(socket));
    });
};

module.exports = setupSocket;
