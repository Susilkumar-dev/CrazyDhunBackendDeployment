const nodemailer = require("nodemailer");
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Will read 'rajususil45@gmail.com'
        pass: process.env.EMAIL_PASS, // Will read 'ntok xwef yrff xzsh'
    },
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