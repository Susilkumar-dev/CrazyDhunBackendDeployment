const nodemailer = require("nodemailer");
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465, // ✅ Force Port 465 (SSL)
    secure: true, // ✅ Must be true for 465
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    // ✅ Add these settings to prevent timeouts
    tls: {
        rejectUnauthorized: false 
    },
    connectionTimeout: 10000, 
    greetingTimeout: 5000,
    socketTimeout: 10000 
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