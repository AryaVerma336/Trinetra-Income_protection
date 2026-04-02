require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const db = require('./database');

const app = express();
app.disable('x-powered-by');
const PORT = process.env.PORT || 3000;

app.use(helmet({
    contentSecurityPolicy: false,
}));
console.log('GIGSHIELD_VERSION: 1.1.0_CSP_DISABLED');
app.use(compression());
app.use(cors());
app.use(express.json());
// Serve the main index.html file statically
app.use(express.static(path.join(__dirname, '')));

// ====================
// Auth Endpoints
// ====================

app.post('/api/auth/login', (req, res) => {
    const { phone, password } = req.body;
    if (!phone) return res.status(400).json({ error: "Phone number required" });

    db.get("SELECT * FROM users WHERE phone = ?", [phone], (err, row) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (!row) {
            // Auto-register if not found
            db.run(
                `INSERT INTO users (phone, password, name, platform, zone, upi, pid, job_type, income) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [phone, password || 'nopass', 'New User', '', '', '', '', 'Freelancer', 0],
                function(err) {
                    if (err) return res.status(500).json({ error: "Failed to create user" });
                    db.get("SELECT * FROM users WHERE id = ?", [this.lastID], (err, newUser) => {
                        res.status(201).json({ user: newUser, isNew: true });
                    });
                }
            );
            return;
        }

        // Allow passwordless auth if password is not provided
        if (password && row.password !== password) return res.status(401).json({ error: "Invalid password" });

        res.json({ user: row });
    });
});

app.post('/api/auth/signup', (req, res) => {
    const { phone, password, name, platform, zone, upi, pid } = req.body;

    // Check if phone already registered
    db.get("SELECT * FROM users WHERE phone = ?", [phone], (err, row) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (row) return res.status(409).json({ error: "Phone number already registered" });

        db.run(
            `INSERT INTO users (phone, password, name, platform, zone, upi, pid) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [phone, password, name, platform, zone, upi, pid],
            function (err) {
                if (err) return res.status(500).json({ error: "Failed to create user" });

                db.get("SELECT * FROM users WHERE id = ?", [this.lastID], (err, newUser) => {
                    res.status(201).json({ user: newUser, isNew: true });
                });
            }
        );
    });
});

app.post('/api/auth/demo', (req, res) => {
    const { type } = req.body;
    const phone = type === 'worker' ? '+91 98765 43210' : '+91 99999 00000';
    db.get("SELECT * FROM users WHERE phone = ?", [phone], (err, row) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (!row) return res.status(404).json({ error: "Demo user not initialized" });
        res.json({ user: row });
    });
});

// ====================
// User Profile & Settings
// ====================

app.put('/api/user/:id', (req, res) => {
    const { name, phone, platform, pid, zone, upi, job_type, income } = req.body;
    db.run(
        `UPDATE users SET name = ?, phone = ?, platform = ?, pid = ?, zone = ?, upi = ?, job_type = ?, income = ? WHERE id = ?`,
        [name, phone, platform, pid, zone, upi, job_type, income, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: "Failed to update profile" });
            db.get("SELECT * FROM users WHERE id = ?", [req.params.id], (err, row) => {
                res.json({ user: row });
            });
        }
    );
});

// ====================
// Policy & Claims
// ====================

app.post('/api/policy', (req, res) => {
    const { phone, income, job_type } = req.body;
    
    // Risk Calculation logic
    let riskMultiplier = 1;
    if (job_type === 'Delivery') riskMultiplier = 1.5; // High Risk
    else if (job_type === 'Driver') riskMultiplier = 1.2; // Medium Risk
    else if (job_type === 'Freelancer') riskMultiplier = 1.0; // Low Risk

    const premium = Math.round((income * 0.005) * riskMultiplier);
    const payout = Math.round(income * 0.5); // Max 50% of income coverage

    const createdAt = new Date().toISOString();

    db.run(
        `INSERT INTO policies (phone, income, job_type, premium, payout, status, created_at) VALUES (?, ?, ?, ?, ?, 'Active', ?)`,
        [phone, income, job_type, premium, payout, createdAt],
        function(err) {
            if (err) return res.status(500).json({ error: "Failed to create policy" });
            db.get("SELECT * FROM policies WHERE id = ?", [this.lastID], (err, policy) => {
                res.status(201).json({ policy });
            });
        }
    );
});

app.get('/api/policy/:phone', (req, res) => {
    db.get("SELECT * FROM policies WHERE phone = ? ORDER BY id DESC LIMIT 1", [req.params.phone], (err, row) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (!row) return res.status(404).json({ error: "No policy found" });
        
        let riskLabel = 'Low';
        if (row.job_type === 'Delivery') riskLabel = 'High';
        else if (row.job_type === 'Driver') riskLabel = 'Medium';
        
        res.json({ policy: row, riskLabel });
    });
});

app.post('/api/claim', (req, res) => {
    const { phone, amount, proof } = req.body;
    if (!phone || !amount) return res.status(400).json({ error: "Missing required fields" });
    
    const fraud_flag = amount > 5000 ? 1 : 0;
    const date = new Date().toISOString();
    
    db.run(
        `INSERT INTO claims (phone, amount, proof, status, fraud_flag, date) VALUES (?, ?, ?, 'Pending Review', ?, ?)`,
        [phone, amount, proof, fraud_flag, date],
        function(err) {
            if (err) return res.status(500).json({ error: "Failed to submit claim" });
            db.get("SELECT * FROM claims WHERE id = ?", [this.lastID], (err, claim) => {
                res.status(201).json({ claim });
            });
        }
    );
});

app.get('/api/claims/:phone', (req, res) => {
    db.all("SELECT * FROM claims WHERE phone = ? ORDER BY id DESC", [req.params.phone], (err, rows) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json({ claims: rows });
    });
});

// ====================
// Gemini AI Proxy Endpoint
// ====================

// A proxy for the Gemini AI completion to hide the API Key from the frontend
app.post('/api/ai/chat', async (req, res) => {
    const { message, userConfig } = req.body;
    let apiKey = req.body.apiKey; // Support passing key from client for settings UI

    if (!apiKey) {
        apiKey = process.env.GEMINI_API_KEY; // Fallback to server side key
    }

    if (!apiKey) {
        return res.status(400).json({ error: "No Gemini API key provided." });
    }

    const systemPrompt = `You are GigShield AI, a helpful assistant for an AI-powered parametric income insurance platform for gig delivery workers in India (Zomato, Swiggy, Blinkit, Amazon). 
The platform protects workers from income loss due to extreme weather (rain, heat, AQI), platform outages, and curfews.
Plans: Basic ₹29/week (₹500 payout), Standard ₹59/week (₹1,200 payout), Pro ₹99/week (₹2,500 payout).
Payouts are automatic via UPI within 90 seconds. AI fraud detection uses GPS, cell tower, motion sensor, and platform activity signals.
${userConfig ? 'Current user setup: ' + JSON.stringify(userConfig) : ''}
Be concise, friendly, and helpful. Answer in 2-4 sentences max unless more detail is needed.`;

    try {
        const fetch = (await import('node-fetch')).default;
        // In a real app we would use google generative ai SDK. For now we use the raw REST endpoint as it was in the frontend.
        // Also use gemini-2.0-flash which is widely available
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt + '\n\nUser: ' + message }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 300 }
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data?.error?.message || 'API error');

        const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I got an empty response.';
        res.json({ reply: textResponse });
    } catch (e) {
        console.error("Gemini proxy error:", e);
        res.status(500).json({ error: e.message || "Failed to contact AI" });
    }
});

// ====================
// Weather Trigger Webhooks (New Insurance Feature)
// ====================
// Simulates an API where an authority (like IMD) pings during severe weather events.
// Automatically finds gig workers in the affected zone and processes an instant claim.
app.post('/api/webhooks/weather', (req, res) => {
    const { zone, severity, condition } = req.body;
    if (!zone || !severity) return res.status(400).json({ error: "Zone and severity required" });

    if (severity === 'SEVERE' || severity === 'EXTREME') {
        const amount = severity === 'EXTREME' ? 1500 : 500;
        const date = new Date().toISOString();
        
        db.all("SELECT * FROM users WHERE zone LIKE ?", [`%${zone}%`], (err, users) => {
            if (err) return res.status(500).json({ error: "Database error" });
            
            // Ensure claims table exists
            db.run(`CREATE TABLE IF NOT EXISTS claims (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                phone TEXT NOT NULL,
                amount REAL NOT NULL,
                date TEXT NOT NULL,
                trigger_type TEXT,
                status TEXT DEFAULT 'Approved'
            )`, () => {
                let claimsCreated = 0;
                users.forEach(user => {
                    db.run("INSERT INTO claims (phone, amount, date, trigger_type, status) VALUES (?, ?, ?, ?, 'Approved')",
                    [user.phone, amount, date, 'Weather: ' + condition], () => {});
                    claimsCreated++;
                });
                
                res.json({ 
                    message: `Weather trigger processed.`, 
                    usersAffected: claimsCreated,
                    payoutPerUser: amount
                });
            });
        });
    } else {
        res.json({ message: "Weather condition not severe enough for trigger." });
    }
});

// ====================
// Live Weather + Location (Real Data)
// ====================
// Uses Open-Meteo (100% free, no API key) + Nominatim (OSM) for reverse geocoding
app.get('/api/weather/live', async (req, res) => {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: "lat and lon required" });

    try {
        const fetch = (await import('node-fetch')).default;

        // 1. Real weather from Open-Meteo (free API)
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,rain,precipitation,wind_speed_10m,weather_code,apparent_temperature&daily=precipitation_sum,temperature_2m_max&timezone=auto&forecast_days=1`;
        const weatherRes = await fetch(weatherUrl);
        const weatherData = await weatherRes.json();
        const current = weatherData.current || {};

        const temp = current.temperature_2m ?? null;
        const feelsLike = current.apparent_temperature ?? null;
        const rain = current.rain ?? 0;
        const precipitation = current.precipitation ?? 0;
        const windSpeed = current.wind_speed_10m ?? 0;
        const humidity = current.relative_humidity_2m ?? null;
        const weatherCode = current.weather_code ?? 0;

        // 2. Reverse geocode using Nominatim (OSM, free, no key)
        const geoUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`;
        const geoRes = await fetch(geoUrl, {
            headers: { 'User-Agent': 'GigShield-App/1.0' }
        });
        const geoData = await geoRes.json();
        const addr = geoData.address || {};
        const area   = addr.suburb || addr.neighbourhood || addr.quarter || addr.village || addr.town || 'Your Area';
        const city   = addr.city || addr.town || addr.county || 'Your City';
        const state  = addr.state || '';

        // 3. Risk Calculation from real data
        // WMO Weather codes: 51-67=rain, 71-77=snow, 80-99=heavy rain/storm
        const heavyRain = weatherCode >= 80 || precipitation > 15 || rain > 10;
        const moderateRain = weatherCode >= 51 || precipitation > 5 || rain > 3;
        const heatStress = temp > 42;
        const extremeWind = windSpeed > 50;
        const strongWind = windSpeed > 30;

        let riskLevel, alertType, alertColor, alertMsg, shouldTrigger;

        if (heavyRain || extremeWind || (heatStress && humidity > 70)) {
            riskLevel = 'EXTREME';
            alertType = heavyRain ? 'Heavy Rain Red Alert' : extremeWind ? 'Extreme Wind Alert' : 'Heat + Humidity Extreme';
            alertColor = '#dc2626';
            alertMsg = heavyRain
                ? `Heavy rain (${precipitation.toFixed(1)}mm) detected. Deliveries severely impacted. Payout triggered.`
                : extremeWind
                ? `Wind speed ${windSpeed.toFixed(0)} km/h — Unsafe for 2-wheelers. Payout triggered.`
                : `Heat index critical: ${temp}°C / Feels ${feelsLike}°C at ${humidity}% humidity.`;
            shouldTrigger = true;
        } else if (moderateRain || heatStress || strongWind) {
            riskLevel = 'HIGH';
            alertType = moderateRain ? 'Rain Alert' : heatStress ? 'Heat Advisory' : 'Wind Advisory';
            alertColor = '#d97706';
            alertMsg = moderateRain
                ? `Rain detected (${precipitation.toFixed(1)}mm). Deliveries may be affected.`
                : heatStress
                ? `High temperature: ${temp}°C. Consider reducing active hours.`
                : `Wind speed ${windSpeed.toFixed(0)} km/h — Use caution on roads.`;
            shouldTrigger = false;
        } else {
            riskLevel = 'LOW';
            alertType = 'Clear Conditions';
            alertColor = '#22c55e';
            alertMsg = `Conditions normal. ${temp}°C, ${precipitation.toFixed(1)}mm rain. Safe for deliveries.`;
            shouldTrigger = false;
        }

        res.json({
            location: { area, city, state, lat: parseFloat(lat), lon: parseFloat(lon) },
            weather: { temp, feelsLike, rain, precipitation, windSpeed, humidity, weatherCode },
            risk: { riskLevel, alertType, alertColor, alertMsg, shouldTrigger }
        });

    } catch (e) {
        console.error('Live weather error:', e.message);
        res.status(500).json({ error: 'Failed to fetch live weather data: ' + e.message });
    }
});

// Startup Validation
if (!process.env.GEMINI_API_KEY) {
    console.warn('\x1b[33m%s\x1b[0m', '⚠️ WARNING: GEMINI_API_KEY is not set in environment variables. AI Chat will not work.');
}

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`GigShield backend listening on port ${PORT} (hosting: 0.0.0.0)`);
    console.log('Production security (helmet) and compression active.');
});

// Graceful Shutdown
const shutdown = async (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(async () => {
        try {
            await db.closeConnection();
            console.log('SQLite connection closed.');
            process.exit(0);
        } catch (err) {
            console.error('Error closing SQLite:', err);
            process.exit(1);
        }
    });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
