const express = require('express');
const app = express();
const router = require('./src/routes/api');
require('dotenv').config();

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require("path");
const mongoose = require('mongoose');

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 🔥 STATIC FILES (MUST BE BEFORE ROUTES)
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

const apiCorsOptions = {
    origin: '*',
    credentials: true,
};

app.use('/api/v1', cors(apiCorsOptions));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(mongoSanitize());
app.use(hpp());
app.use(cookieParser());

// Rate Limit
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3000,
});
app.use(limiter);

// Connect DB
async function connectDB() {
    if (!process.env.MONGO_URI) {
        console.error('❌ MONGO_URI is not set in the environment variables.');
        return;
    }

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            autoIndex: true,
            serverSelectionTimeoutMS: 5000,
        });

        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
    }
}
connectDB();

// Routing
app.use('/api/v1', router);

// 404 handler — FIXED FOR EXPRESS 5
app.use('*', (req, res) => {
    res.status(404).json({ status: "fail", data: "Not Found" });
});

module.exports = app;
