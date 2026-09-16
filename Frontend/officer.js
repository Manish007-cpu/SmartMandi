const API_URL = "/api";


// ==========================================
// LOAD QUEUE
// ==========================================

async function loadQueue() {

    try {

        const centerElement =
            document.getElementById(
                "center"
            );

        const center =
            centerElement.value;


        let url =
            `${API_URL}/officer/queue`;


        if (center) {

            url +=
                `?center=${encodeURIComponent(center)}`;
        }


        const response =
            await fetch(url);


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                `HTTP ${response.status}: ${errorText}`
            );
        }


        const data =
            await response.json();


        console.log(
            "Officer data:",
            data
        );


        updateStats(
            data.stats
        );


        updateCurrentProcessing(
            data.currentProcessing
        );


        displayQueue(
            data.farmers
        );


    } catch (error) {

        console.error(
            "Queue loading error:",
            error
        );


        document.getElementById(
            "queue"
        ).innerHTML = `

            <div class="loading">

                ❌ Unable to load farmer queue.

                <br><br>

                Check that the backend server is running.

            </div>
        `;
    }
}


// ==========================================
// UPDATE STATISTICS
// ==========================================

function updateStats(stats) {

    document.getElementById(
        "total"
    ).textContent =
        stats.total || 0;


    document.getElementById(
        "waiting"
    ).textContent =
        stats.waiting || 0;


    document.getElementById(
        "processing"
    ).textContent =
        stats.processing || 0;


    document.getElementById(
        "completed"
    ).textContent =
        stats.completed || 0;
}


// ==========================================
// CURRENT PROCESSING TOKEN
// ==========================================

function updateCurrentProcessing(
    farmer
) {

    const tokenElement =
        document.getElementById(
            "currentToken"
        );


    const farmerElement =
        document.getElementById(
            "currentFarmer"
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
// DISPLAY QUEUE
// ==========================================

function displayQueue(farmers) {

    const queue =
        document.getElementById(
            "queue"
        );


    queue.innerHTML = "";


    if (
        !farmers ||
        farmers.length === 0
    ) {

        queue.innerHTML = `

            <div class="loading">

                👨‍🌾

                <br><br>

                No farmers registered yet.

            </div>
        `;

        return;
    }


    farmers.forEach(
        farmer => {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "farmer";


            const status =
                farmer.status ||
                "Waiting";


            const statusClass =
                status.toLowerCase();


            let processButton = "";


            if (
                status === "Waiting"
            ) {

                processButton = `

                    <button
                        onclick="
                            changeStatus(
                                '${farmer._id}',
                                'Processing'
                            )
                        "
                    >

                        🚜 Process

                    </button>

                `;
            }


            let completeButton = "";


            if (
                status !== "Completed"
            ) {

                completeButton = `

                    <button
                        onclick="
                            changeStatus(
                                '${farmer._id}',
                                'Completed'
                            )
                        "
                    >

                        ✅ Complete

                    </button>

                `;
            }


            div.innerHTML = `

                <div class="token">

                    #${farmer.tokenNumber}

                </div>


                <div>

                    <strong>
                        ${farmer.name}
                    </strong>

                    <br>

                    🌾 ${farmer.crop}

                    <br>

                    📦 ${farmer.quantity}
                    Quintals

                    <br>

                    📍 ${farmer.center}

                </div>


                <div
                    class="status ${statusClass}"
                >

                    ${status}

                </div>


                <div class="actions">

                    ${processButton}

                    ${completeButton}

                </div>

            `;


            queue.appendChild(
                div
            );
        }
    );
}


// ==========================================
// CHANGE FARMER STATUS
// ==========================================

async function changeStatus(
    farmerId,
    status
) {

    try {

        const response =
            await fetch(
                `${API_URL}/officer/farmer/${farmerId}/status`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        status: status
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Status update failed"
            );
        }


        console.log(
            "Status updated:",
            data
        );


        await loadQueue();


    } catch (error) {

        console.error(
            "Status update error:",
            error
        );


        alert(
            "❌ " +
            error.message
        );
    }
}


// ==========================================
// CENTER CHANGE
// ==========================================

document
    .getElementById("center")
    .addEventListener(
        "change",
        loadQueue
    );


// ==========================================
// INITIAL LOAD
// ==========================================

loadQueue();


// ==========================================
// AUTO REFRESH
// ==========================================

setInterval(
    loadQueue,
    5000
);