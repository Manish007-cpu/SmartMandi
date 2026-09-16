let currentLanguage = "en";


// ==========================================
// LANGUAGE
// ==========================================

function toggleLanguage() {

    currentLanguage =
        currentLanguage === "en"
            ? "te"
            : "en";


    const elements =
        document.querySelectorAll(
            "[data-en][data-te]"
        );


    elements.forEach(
        element => {

            element.textContent =
                currentLanguage === "en"
                    ? element.dataset.en
                    : element.dataset.te;

        }
    );


    document.getElementById(
        "languageButton"
    ).textContent =
        currentLanguage === "en"
            ? "తెలుగు"
            : "English";
}


// ==========================================
// FARMER REGISTRATION
// ==========================================

const farmerForm =
    document.getElementById(
        "farmerForm"
    );


farmerForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const name =
            document.getElementById(
                "farmerName"
            ).value.trim();


        const crop =
            document.getElementById(
                "crop"
            ).value;


        const quantity =
            document.getElementById(
                "quantity"
            ).value;


        const center =
            document.getElementById(
                "center"
            ).value;


        if (
            !name ||
            !crop ||
            !quantity ||
            !center
        ) {

            alert(
                "❌ Please fill all fields."
            );

            return;
        }


        try {

            const response =
                await fetch(
                    "/api/farmers/register",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            name: name,

                            crop: crop,

                            quantity:
                                Number(quantity),

                            center: center

                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                alert(
                    "❌ " +
                    data.message
                );

                return;
            }


            const token =
                data.farmer.tokenNumber;


            alert(
                "✅ Registration Successful!\n\n" +

                "🎟️ Your Token: " +
                token +

                "\n\n🌾 Crop: " +
                data.farmer.crop +

                "\n📦 Quantity: " +
                data.farmer.quantity +
                " Quintals" +

                "\n📍 Center: " +
                data.farmer.center
            );


            console.log(
                "Saved farmer:",
                data.farmer
            );


            // Save farmer information
            // in browser

            localStorage.setItem(
                "smartMandiToken",
                token
            );


            localStorage.setItem(
                "smartMandiCenter",
                center
            );


            farmerForm.reset();


            // Load queue

            loadSmartQueue(
                center,
                token
            );


        } catch (error) {

            console.error(
                "Registration error:",
                error
            );


            alert(
                "❌ Cannot connect to SmartMandi backend.\n\n" +
                "Make sure the backend server is running."
            );
        }
    }
);


// ==========================================
// SMART QUEUE
// ==========================================

async function loadSmartQueue(
    selectedCenter,
    farmerToken
) {

    try {

        const response =
            await fetch(
                `/api/officer/queue?center=${encodeURIComponent(selectedCenter)}`
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load queue"
            );
        }


        const data =
            await response.json();


        const farmers =
            data.farmers || [];


        // ==================================
        // CURRENT PROCESSING TOKEN
        // ==================================

        updateCurrentProcessing(
            data.currentProcessing
        );


        // ==================================
        // FARMERS AHEAD
        // ==================================

        const peopleAhead =
            farmers.filter(

                farmer =>

                    farmer.tokenNumber <
                    farmerToken &&

                    farmer.status !==
                    "Completed"

            ).length;


        // ==================================
        // WAITING TIME
        // ==================================

        const minutesPerFarmer = 2;


        const estimatedWait =
            peopleAhead *
            minutesPerFarmer;


        // ==================================
        // CAPACITY
        // ==================================

        const centerCapacity = 100;


        // ==================================
        // UPDATE UI
        // ==================================

        document.getElementById(
            "peopleAhead"
        ).textContent =
            peopleAhead;


        document.getElementById(
            "waitTime"
        ).textContent =
            estimatedWait +
            " min";


        document.getElementById(
            "capacity"
        ).textContent =
            centerCapacity +
            " Q";


        // ==================================
        // ARRIVAL TIME
        // ==================================

        const now =
            new Date();


        const arrival =
            new Date(
                now.getTime() +
                estimatedWait *
                60 *
                1000
            );


        const arrivalTime =
            arrival.toLocaleTimeString(
                [],
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );


        document.getElementById(
            "arrivalTime"
        ).textContent =
            arrivalTime;


        // ==================================
        // SMART MESSAGE
        // ==================================

        let message;


        if (
            peopleAhead === 0
        ) {

            message =
                "The queue is currently clear. You can proceed to the center now.";

        } else if (
            peopleAhead <= 5
        ) {

            message =
                "The queue is short. You should arrive soon.";

        } else if (
            peopleAhead <= 15
        ) {

            message =
                "There is moderate waiting. Arriving around the recommended time can reduce idle waiting.";

        } else {

            message =
                "The queue is busy. Consider arriving at the recommended time to avoid unnecessary waiting.";
        }


        document.getElementById(
            "arrivalMessage"
        ).textContent =
            message;


        document.getElementById(
            "smartRecommendation"
        ).style.display =
            "block";


    } catch (error) {

        console.error(
            "Smart queue error:",
            error
        );
    }
}


// ==========================================
// CURRENT PROCESSING
// ==========================================

function updateCurrentProcessing(
    farmer
) {

    const tokenElement =
        document.getElementById(
            "currentProcessingToken"
        );


    const farmerElement =
        document.getElementById(
            "currentProcessingFarmer"
        );


    if (!farmer) {

        tokenElement.textContent =
            "No Token";


        farmerElement.textContent =
            "No farmer is currently being processed.";


        return;
    }


    tokenElement.textContent =
        `Token #${farmer.tokenNumber}`;


    farmerElement.textContent =
        `${farmer.name} • ${farmer.crop} • ${farmer.quantity} Quintals`;
}


// ==========================================
// LOAD SAVED FARMER QUEUE
// ==========================================

const savedToken =
    localStorage.getItem(
        "smartMandiToken"
    );


const savedCenter =
    localStorage.getItem(
        "smartMandiCenter"
    );


if (
    savedToken &&
    savedCenter
) {

    loadSmartQueue(
        savedCenter,
        Number(savedToken)
    );
}


// ==========================================
// CHECK CENTER WHEN CHANGED
// ==========================================

document
    .getElementById("center")
    .addEventListener(
        "change",
        function () {

            const center =
                this.value;


            if (!center) {
                return;
            }


            // If farmer has a token,
            // show live queue.

            if (savedToken) {

                loadSmartQueue(
                    center,
                    Number(savedToken)
                );
            }

        }
    );


// ==========================================
// AUTO REFRESH EVERY 5 SECONDS
// ==========================================

setInterval(
    function () {

        const token =
            localStorage.getItem(
                "smartMandiToken"
            );


        const center =
            localStorage.getItem(
                "smartMandiCenter"
            );


        if (
            token &&
            center
        ) {

            loadSmartQueue(
                center,
                Number(token)
            );
        }

    },
    5000
);


// ==========================================
// NOTIFICATIONS
// ==========================================

function sendNotification() {

    alert(
        "🔔 Notifications Enabled!\n\n" +
        "You will be notified when your token is approaching."
    );
}