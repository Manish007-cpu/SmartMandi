const mongoose = require("mongoose");

const farmerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        crop: {
            type: String,
            required: true,
            trim: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        center: {
            type: String,
            required: true,
            trim: true
        },

        tokenNumber: {
            type: Number,
            required: true,
            unique: true
        },

        status: {
            type: String,
            enum: [
                "Waiting",
                "Processing",
                "Completed"
            ],
            default: "Waiting"
        },

        createdAt: {
            type: Date,
            default: Date.now
        }
    }
);

module.exports = mongoose.model(
    "Farmer",
    farmerSchema
);