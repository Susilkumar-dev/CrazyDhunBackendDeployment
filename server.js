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


!// Add this after your other middleware
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

//! Start the server
app.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT}`);
});





