// require('dotenv').config(); // Load environment
// const express = require("express");
// const cors = require('cors');
// const path = require('path');
// const connectDB = require('./config/database/db');

// //! Route imports
// const publicRouter = require("./Routes/PublicRoutes/publicRoute");
// const adminRouter = require("./Routes/AdminRoutes/adminRoute");
// const userRouter = require("./Routes/UserRoutes/userRoute");
// const { handleMulterError } = require('./middleware/uploadMiddleware');

// //! Database connection
// connectDB();

// const app = express();

// //! Middleware
// app.use(cors());
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());


// !// Add this after your other middleware
// app.use(handleMulterError);

// //! This makes the 'uploads' folder publicly accessible to serve your songs and images
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// //!  Routers
// app.use('/public', publicRouter);
// app.use("/admin", adminRouter);
// app.use("/user", userRouter);

// //! A simple root route for testing if the server is running
// app.get("/", (req, res) => {
//     res.json({ message: "Welcome to the Dhun Music API" });
// });

// //! Start the server
// app.listen(process.env.PORT, () => {
//     console.log(`Server started on port ${process.env.PORT}`);
// });




require("dotenv").config(); // Load environment variables
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/database/db");
const { handleMulterError } = require("./middleware/uploadMiddleware");

//! Route imports
const publicRouter = require("./Routes/PublicRoutes/publicRoute");
const adminRouter = require("./Routes/AdminRoutes/adminRoute");
const userRouter = require("./Routes/UserRoutes/userRoute");

//! Initialize express app
const app = express();

//! Connect Database
connectDB();

//! CORS Configuration
const corsOptions = {
  origin: [
    "http://localhost:5173",           // Local dev
    "https://dhunbeat.netlify.app"     // ✅ Your Netlify domain (change if different)
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));

//! Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//! Handle multer errors
app.use(handleMulterError);

//! Static files for uploads (images, songs, etc.)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//! Routes
app.use("/public", publicRouter);
app.use("/admin", adminRouter);
app.use("/user", userRouter);

//! Root route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Dhun Music API" });
});

//! Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

