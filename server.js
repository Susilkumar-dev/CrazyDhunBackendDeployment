require('dotenv').config(); // Load environment
const express = require("express");
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database/db');

//! Route imports
const publicRouter = require("./Routes/PublicRoutes/publicRoute");
const adminRouter = require("./Routes/AdminRoutes/adminRoute");
const userRouter = require("./Routes/UserRoutes/userRoute");
const { handleMulterError } = require('./middleware/uploadMiddleware');

//! Database connection
connectDB();

const app = express();

//! Middleware
app.use(cors({ origin: "*", credentials: true }));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use(handleMulterError);

//! This makes the 'uploads' folder publicly accessible to serve your songs and images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//!  Routers
app.use('/public', publicRouter);
app.use("/admin", adminRouter);
app.use("/user", userRouter);

//! A simple root route for testing if the server is running
app.get("/", (req, res) => {
    res.json({ message: "Welcome to the Dhun Music API" });
});


// Add error logging middleware BEFORE routes
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Error handling middleware AFTER routes
app.use((err, req, res, next) => {
    console.error('🔥 Unhandled Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});



console.log('Environment check:');
console.log('PORT:', process.env.PORT);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('MONGO_URL exists:', !!process.env.MONGO_URL);

// If EMAIL_PASS is undefined, you have a .env loading issue
if (!process.env.EMAIL_PASS) {
    console.error('❌ ERROR: EMAIL_PASS is not loaded from .env file');
}


//! Start the server
app.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT}`);
});





