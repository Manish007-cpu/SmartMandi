const API_URL = "http://localhost:5000/api";

let generatedOTP = null;


// SEND OTP
function sendOTP() {

    const mobile =
        document.getElementById("mobile").value.trim();

    if (mobile.length !== 10) {

        showMessage(
            "Enter a valid 10-digit mobile number",
            "red"
        );

        return;
    }


    // DEMO OTP
    generatedOTP = "123456";

    document.getElementById("otpSection")
        .style.display = "block";


    showMessage(
        "Demo OTP sent: 123456",
        "green"
    );
}


// VERIFY OTP
async function verifyOTP() {

    const mobile =
        document.getElementById("mobile").value.trim();

    const otp =
        document.getElementById("otp").value.trim();


    if (otp !== generatedOTP) {

        showMessage(
            "Incorrect OTP",
            "red"
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/farmers/mobile/${mobile}`
            );


        if (!response.ok) {

            showMessage(
                "Farmer not found. Please register first.",
                "red"
            );

            return;
        }


        const farmer =
            await response.json();


        localStorage.setItem(
            "smartMandiFarmer",
            JSON.stringify(farmer)
        );


        window.location.href =
            "index.html";


    } catch (error) {

        console.error(error);

        showMessage(
            "Backend connection failed",
            "red"
        );
    }
}


function showMessage(text, color) {

    const message =
        document.getElementById("message");

    message.textContent = text;

    message.style.color = color;
}