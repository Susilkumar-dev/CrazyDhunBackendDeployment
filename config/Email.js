const nodemailer = require("nodemailer");
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 2525, // ✅ Changed to 2525 (Alternative Brevo port)
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    // ✅ These helps debug connection issues
    logger: true,
    debug: true
});

// Verify connection
transporter.verify(function (error, success) {
    if (error) {
        console.log("❌ Email Server Error: ", error);
    } else {
        console.log("✅ Brevo Email Server is ready to send messages");
    }
});

module.exports = transporter;