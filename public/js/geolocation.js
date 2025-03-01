document.addEventListener("DOMContentLoaded", function () {
    const locationElement = document.getElementById("location");
    const saveButton = document.getElementById("saveLocation");

    if (navigator.geolocation) {
        console.log("📡 Request to determine location...");

        navigator.geolocation.getCurrentPosition(async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            console.log(`✅ Coordinates received: ${latitude}, ${longitude}`);

            try {
                console.log(`📡 Sending a request to the geocoding API: lat=${latitude}, lon=${longitude}`);
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await response.json();

                if (!data || !data.address) {
                    throw new Error("Geocoding returned no data");
                }

                const city = data.address.city || data.address.town || data.address.village || "Unknown";
                const region = data.address.state || "Unknown";
                const country = data.address.country || "Unknown";
                const postcode = data.address.postcode || "Unknown";
                const district = data.address.city_district || "Unknown";
                const road = data.address.road || "Unknown";
                const houseNumber = data.address.house_number || "N/A";

                console.log(`✅ The data has been determined: City=${city}, Region=${region}, Country=${country}, Postcode=${postcode}, Road=${road}, House=${houseNumber}`);

                locationElement.innerHTML = `
                    <strong>IP Address:</strong> Loading...<br>
                    <strong>City:</strong> ${city}<br>
                    <strong>Region:</strong> ${region}<br>
                    <strong>District:</strong> ${district}<br>
                    <strong>Street:</strong> ${road} ${houseNumber}<br>
                    <strong>Postcode:</strong> ${postcode}<br>
                    <strong>Country:</strong> ${country}<br>
                    <strong>Latitude:</strong> ${latitude}<br>
                    <strong>Longitude:</strong> ${longitude}
                `;

                const ipResponse = await fetch("https://api64.ipify.org?format=json");
                const ipData = await ipResponse.json();

                if (ipData && ipData.ip) {
                    locationElement.innerHTML = locationElement.innerHTML.replace("Loading...", ipData.ip);
                }

                if (!saveButton.dataset.listenerAdded) {
                    saveButton.dataset.listenerAdded = "true";

                    saveButton.addEventListener("click", async function () {
                        console.log("📡 Sending data to server...");
                        try {
                            const response = await fetch("/api/save-location", { 
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ latitude, longitude, city, region, country, postcode, district, road, houseNumber, ip: ipData.ip })
                            });

                            const result = await response.json();
                            if (response.ok) {
                                alert("✅ Location saved!");
                            } else {
                                alert("❌ Failed to save location: " + result.error);
                            }
                        } catch (error) {
                            console.error("❌ Error while saving:", error);
                            alert("Error saving location.");
                        }
                    });
                }

            } catch (error) {
                console.error("❌ Error retrieving city data:", error);
                locationElement.textContent = "Error getting location data.";
            }
        }, (error) => {
            console.error("❌ Geolocation error:", error);
            locationElement.textContent = "Geolocation permission denied or unavailable.";
        });
    } else {
        console.error("❌ The browser does not support geolocation.");
        locationElement.textContent = "Geolocation is not supported by this browser.";
    }
});


