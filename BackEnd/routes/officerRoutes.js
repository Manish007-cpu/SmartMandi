const express = require("express");
const router = express.Router();

const Farmer = require("../models/Farmer");


// ==========================================
// GET LIVE QUEUE
// ==========================================

router.get("/queue", async (req, res) => {

    try {

        const filter = {};

        if (req.query.center) {
            filter.center = req.query.center;
        }


        const farmers = await Farmer
            .find(filter)
            .sort({ tokenNumber: 1 });


        // Find currently processing farmer

        const currentProcessing =
            farmers.find(
                farmer =>
                    farmer.status === "Processing"
            );


        const stats = {

            total: farmers.length,

            waiting: farmers.filter(
                farmer =>
                    farmer.status === "Waiting"
            ).length,

            processing: farmers.filter(
                farmer =>
                    farmer.status === "Processing"
            ).length,

            completed: farmers.filter(
                farmer =>
                    farmer.status === "Completed"
            ).length
        };


        res.json({

            stats: stats,

            currentProcessing:
                currentProcessing || null,

            farmers: farmers

        });

    } catch (error) {

        console.error(
            "QUEUE ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to load queue"
        });
    }
});


// ==========================================
// UPDATE FARMER STATUS
// ==========================================

router.patch(
    "/farmer/:id/status",
    async (req, res) => {

        try {

            const {
                status
            } = req.body;


            const allowedStatuses = [
                "Waiting",
                "Processing",
                "Completed"
            ];


            if (
                !allowedStatuses.includes(status)
            ) {

                return res.status(400).json({
                    message: "Invalid status"
                });
            }


            // Find farmer

            const farmer =
                await Farmer.findById(
                    req.params.id
                );


            if (!farmer) {

                return res.status(404).json({
                    message: "Farmer not found"
                });
            }


            // ==================================
            // ONLY ONE PROCESSING FARMER
            // PER CENTER
            // ==================================

            if (
                status === "Processing"
            ) {

                const existingProcessing =
                    await Farmer.findOne({

                        center: farmer.center,

                        status: "Processing",

                        _id: {
                            $ne: farmer._id
                        }
                    });


                if (
                    existingProcessing
                ) {

                    return res.status(400).json({

                        message:
                            `Token #${existingProcessing.tokenNumber} is already being processed at ${farmer.center}. Complete it before processing another farmer.`
                    });
                }
            }


            farmer.status = status;

            await farmer.save();


            res.json({

                message:
                    "Status updated successfully",

                farmer: farmer

            });

        } catch (error) {

            console.error(
                "STATUS UPDATE ERROR:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to update status"
            });
        }
    }
);


module.exports = router;