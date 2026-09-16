const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");


// Load environment variables
dotenv.config();


// Create Express app
const app = express();


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());

app.use(express.json());


// ==========================================
// ROUTES
// ==========================================

const farmerRoutes =
    require("./routes/farmerRoutes");

const officerRoutes =
    require("./routes/officerRoutes");


app.use(
    "/api/farmers",
    farmerRoutes
);

app.use(
    "/api/officer",
    officerRoutes
);


// ==========================================
// SERVE FRONTEND
// ==========================================

app.use(
    express.static(
        path.join(__dirname, "../Frontend")
    )
);


// ==========================================
// HOME PAGE
// ==========================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "../Frontend/index.html"
        )
    );

});


// ==========================================
// MONGODB CONNECTION
// ==========================================

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {

        console.log(
            "MongoDB connected successfully"
        );


        // Start server
        const PORT =
            process.env.PORT || 5000;


        app.listen(
            PORT,
            () => {

                console.log(
                    `SmartMandi server running at http://localhost:${PORT}`
                );

            }
        );

    })
    .catch((error) => {

        console.error(
            "MongoDB connection failed:",
            error
        );

    });