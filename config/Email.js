const nodemailer = require("nodemailer");
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,            // ✅ Changed to 587 (Standard for Cloud Servers)
    secure: false,        // ✅ Must be false for port 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false // ✅ Helps prevent SSL errors on some cloud networks
    },
    connectionTimeout: 10000, // ✅ Wait 10 seconds before failing
});

// Verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.log("❌ Email Server Error: ", error);
    } else {
        console.log("✅ Email Server is ready to send messages");
    }
});

module.exports = transporter;