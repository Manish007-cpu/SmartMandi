const express = require("express");
const router = express.Router();

const Farmer = require("../models/Farmer");

// ==========================================
// REGISTER FARMER
// POST /api/farmers/register
// ==========================================

router.post("/register", async (req, res) => {
    try {
        const {
            name,
            crop,
            quantity,
            center
        } = req.body;

        // Check required fields
        if (
            !name ||
            !crop ||
            !quantity ||
            !center
        ) {
            return res.status(400).json({
                message: "Please fill all fields"
            });
        }

        // Find latest token
        const lastFarmer = await Farmer
            .findOne()
            .sort({ tokenNumber: -1 });

        const nextToken =
            lastFarmer
                ? lastFarmer.tokenNumber + 1
                : 1;

        // Create farmer
        const farmer = new Farmer({
            name: name.trim(),
            crop: crop.trim(),
            quantity: Number(quantity),
            center: center.trim(),
            tokenNumber: nextToken,
            status: "Waiting"
        });

        // Save to MongoDB
        await farmer.save();

        res.status(201).json({
            message: "Farmer registered successfully",
            farmer: farmer
        });

    } catch (error) {

        console.error(
            "REGISTER FARMER ERROR:",
            error
        );

        res.status(500).json({
            message: "Server error while registering farmer"
        });
    }
});


// ==========================================
// GET ALL FARMERS
// GET /api/farmers
// ==========================================

router.get("/", async (req, res) => {
    try {

        const farmers = await Farmer
            .find()
            .sort({ tokenNumber: 1 });

        res.json(farmers);

    } catch (error) {

        console.error(
            "GET FARMERS ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to get farmers"
        });
    }
});


module.exports = router;