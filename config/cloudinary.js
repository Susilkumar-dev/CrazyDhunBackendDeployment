const cloudinary = require("cloudinary").v2;
require('dotenv').config();

// THE FIX: The variable names now EXACTLY match your .env file
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,      // Corrected: was CLOUDNARY_API_KEY
    api_secret: process.env.CLOUDINARY_API_SECRET  // Corrected: was CLOUDNARY_API_SECRET
});

module.exports = cloudinary;