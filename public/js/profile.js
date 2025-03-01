const backColors = [
    "linear-gradient(to bottom right, #476C9D, #7497CF, #2E4C72)",
    "linear-gradient(to bottom right, #18283D, #2F4E75, #18283D)"
];
const footBtnColor = ["#476C9D", "#18283D"];
const setColor = ["#7497CF", "#35547E"];
const containerColor = ["#FFFFFF", "#4A4A4A"];
const navlinkColor = ["#2E4C72", "#FFFFFF"];

let currentColorIndex = 0;

function changeBackground() {
    currentColorIndex = (currentColorIndex + 1) % backColors.length;
    applyColors();
}

function applyColors() {
    document.body.style.background = backColors[currentColorIndex];
    document.getElementById("myFooter").style.background = footBtnColor[currentColorIndex];
    Array.from(document.getElementsByClassName('btn')).forEach(btn => btn.style.backgroundColor = footBtnColor[currentColorIndex]);
    Array.from(document.getElementsByClassName('set')).forEach(set => set.style.backgroundColor = setColor[currentColorIndex]);
    Array.from(document.getElementsByClassName('col')).forEach(col => col.style.backgroundColor = containerColor[currentColorIndex]);
    Array.from(document.getElementsByClassName('nav-link')).forEach(navLink => navLink.style.color = navlinkColor[currentColorIndex]);
    updateNavbar();
}

function updateNavbar() {
    const navbar = document.getElementById('myNavbar');
    navbar.classList.toggle('navbar-light');
    navbar.classList.toggle('navbar-dark');
    navbar.classList.toggle('bg-light');
    navbar.classList.toggle('bg-dark');
    document.body.classList.toggle('bg-light');
    document.body.classList.toggle('bg-dark');
}

document.addEventListener('DOMContentLoaded', () => {
    const readMoreButton = document.getElementById('readMoreBtn');
    const extraContentInfo = document.getElementById('extraContent');

    function readMore(){
        if (extraContentInfo.style.display === 'none' || extraContentInfo.style.display === '') {
            extraContentInfo.style.display = 'block';
            readMoreButton.innerText = 'Hide'; 
        } else {
            extraContentInfo.style.display = 'none';
            readMoreButton.innerText = 'Read more'; 
        }
    }

    readMoreButton.addEventListener('click', readMore);

    const showTimeBtn = document.getElementById('timeBtn');

    /* Time */

    function showTime() {
        showTimeBtn.innerHTML = Date();
    }
    showTimeBtn.addEventListener('click', showTime);

    function displayGreeting() {
        const greetingElement = document.getElementById("greeting");
        const currentHour = new Date().getHours(); 
        let greeting;

        switch (true) {
            case (currentHour >= 5 && currentHour < 12):
                greeting = "Good morning!";
                break;
            case (currentHour >= 12 && currentHour < 18):
                greeting = "Good afternoon!";
                break;
            case (currentHour >= 18 && currentHour < 22):
                greeting = "Good evening!";
                break;
            default:
                greeting = "Good night!";
        }

        greetingElement.textContent = greeting;
    }

    

    document.getElementById("notif_btn").addEventListener("click", function() {
        const button = document.getElementById("notif_btn");
        button.textContent = button.textContent === "Off" ? "On" : "Off";
    });

    
});

document.addEventListener("DOMContentLoaded", function () {
    var langSelect = document.getElementById("lang_select");

    var savedLang = localStorage.getItem("selectedLanguage");
    if (savedLang) {
        setTimeout(() => applyTranslation(savedLang), 1000);
        langSelect.value = savedLang;
    }

    langSelect.addEventListener("change", function () {
        var selectedLang = this.value;
        if (selectedLang) {
            localStorage.setItem("selectedLanguage", selectedLang);
            applyTranslation(selectedLang);
        }
    });

    function applyTranslation(lang) {
        var googleFrame = document.querySelector(".goog-te-combo");
        if (googleFrame) {
            googleFrame.value = lang;
            googleFrame.dispatchEvent(new Event("change"));
        } else {
            setTimeout(() => applyTranslation(lang), 500);
        }
    }
});


/* Load User Profile */
async function loadProfile() {
    try {
        const response = await fetch('/profile/data'); 
        if (!response.ok) throw new Error('Failed to fetch profile data');

        const user = await response.json();
        document.getElementById('fig_name').textContent = user.username || 'Unknown';
        document.getElementById('fig_email').textContent = user.email || 'Unknown';
    } catch (err) {
        console.error('Error loading profile:', err);
    }
}

/* Logout Handler */
function handleLogout() {
    fetch('/logout', { method: 'POST' }) 
        .then(() => {
            window.location.href = '/login';
        })
        .catch(err => console.error('Error logging out:', err));
}

/* Attach Event Listeners */
document.addEventListener('DOMContentLoaded', () => {
    loadProfile();

    document.getElementById('changeBtn').addEventListener('click', changeBackground);
    document.getElementById('logoutButton').addEventListener('click', handleLogout);
});

document.addEventListener("DOMContentLoaded", async function () {
    const geoBtn = document.getElementById("geo_btn");

    try {
        const response = await fetch("/geolocation");
        const data = await response.json();

        if (data && data.city) {
            geoBtn.innerHTML = data.city;
        } else {
            geoBtn.innerHTML = "Set";
        }
    } catch (error) {
        console.error("Error loading geolocation:", error);
    }
});

document.addEventListener("DOMContentLoaded", async function () {
    const notifBtn = document.getElementById("notif_btn");
    console.log("Button found?", notifBtn);
    let status = "Off"; 

    let userEmail = null;
    try {
        const response = await fetch("/get-user-email");
        const data = await response.json();
        userEmail = data.email;
        console.log("Received email:", userEmail);
    } catch (error) {
        console.error("Error receiving email:", error);
    }

    notifBtn.addEventListener("click", async function () {
        if (!userEmail) {
            console.error("User email not found.");
            return;
        }

        status = status === "Off" ? "On" : "Off";
        notifBtn.textContent = status === "On" ? "On" : "Off";

        console.log("Sending a request:", { email: userEmail, status });

        try {
            const response = await fetch("http://localhost:3000/send-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: userEmail, status }),
            });

            console.log("Server response:", response.status);
            const data = await response.json();
            console.log("Data from the server:", data);

        } catch (error) {
            console.error("Error sending request:", error);
        }
    });
});

