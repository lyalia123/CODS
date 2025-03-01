require('dotenv').config();
const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const router = express.Router();

const mongoUri = process.env.MONGO_URI;
const ipGeoApiKey = process.env.GEOPOSITION_API_KEY;

// Middleware
router.use(express.json());

// Route: Real-time Weather Data
router.get('/weather', async (req, res) => {
    const { city } = req.query;
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
        console.error('API Key is missing');
        return res.status(500).json({ error: 'API Key is missing' });
    }

    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await axios.get(apiUrl);
        const data = response.data;

        res.json({
            city: data.name,
            country: data.sys.country,
            coordinates: data.coord,
            temperature: data.main.temp,
            feels_like: data.main.feels_like,
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            wind_speed: data.wind.speed,
            weather_description: data.weather[0].description,
            icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`,
            rain_volume: data.rain ? data.rain['3h'] || 0 : 0
        });
    } catch (error) {
        console.error('Error fetching weather data:', error.message);
        res.status(500).json({ error: 'Error fetching weather data' });
    }
});

// Route: News Data
router.get('/news', async (req, res) => {
    const { city } = req.query;
    const apiKey = process.env.NEWS_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API Key is missing' });
    }
    if (!city) {
        return res.status(400).json({ error: 'City is required' });
    }

    const apiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(city)}&apiKey=${apiKey}`;

    try {
        const response = await axios.get(apiUrl);
        const articles = response.data.articles.map((article) => ({
            title: article.title,
            description: article.description,
            url: article.url,
            source: article.source.name,
        }));

        res.json({ city, articles });
    } catch (error) {
        console.error('Error fetching news data:', error.message);
        res.status(500).json({ error: 'Unable to fetch news data' });
    }
});

const locationSchema = new mongoose.Schema({
    ip: String,
    city: String,
    region: String,
    country: String,
    postcode: String,
    district: String,
    road: String,
    houseNumber: String,
    latitude: Number,
    longitude: Number,
    timestamp: { type: Date, default: Date.now }
});

const Location = mongoose.model('Location', locationSchema);

//  Api IP
router.get('/get-location', async (req, res) => {
    try {
        let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        // Если IP == '::1' (локальный), меняем на '127.0.0.1'
        if (ip === '::1') {
            ip = '127.0.0.1';
        }

        console.log(`📡 Determine the location for the IP: ${ip}`);

        // Запрос к API
        const geoApiUrl = `https://api.ipgeolocation.io/ipgeo?apiKey=${ipGeoApiKey}&ip=${ip}`;
        const { data } = await axios.get(geoApiUrl);

        // Проверяем, что API вернул город
        if (!data || !data.city) {
            console.error("❌ Error: API did not return city.");
            return res.status(400).json({ error: "Unable to determine location" });
        }

        console.log("✅ Geodata received:", data);

        // Создаём объект местоположения
        const locationData = new Location({
            ip,
            city: data.city,
            region: data.state_prov,
            country: data.country_name,
            postcode: data.zipcode || "Unknown",
            district: data.district || "Unknown",
            street: data.street || "Unknown",
            latitude: data.latitude,
            longitude: data.longitude
        });

        // Сохраняем в базу
        await locationData.save(); 

        res.json({ message: "Geodata is saved in the database", location: locationData });

    } catch (error) {
        if (error.response) {
            console.error(`❌ API error (${error.response.status}):`, error.response.data);
            return res.status(error.response.status).json({ error: error.response.data });
        }

        console.error("❌ Error getting geolocation:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Save geolocation
router.post('/save-location', async (req, res) => {
    try {
        const { latitude, longitude, city, region, country, postcode, district, road, houseNumber, ip } = req.body;

        if (!latitude || !longitude || !city || !region || !country || !ip) {
            return res.status(400).json({ error: "Missing location data" });
        }

        const locationData = new Location({
            ip,
            city,
            region,
            country,
            postcode,
            district,
            road,
            houseNumber,
            latitude,
            longitude
        });

        await locationData.save(); 

        res.json({ message: "Location saved successfully!", location: locationData });
    } catch (error) {
        console.error("Error saving location:", error);
        res.status(500).json({ error: "Server error" });
    }
});


module.exports = router;
