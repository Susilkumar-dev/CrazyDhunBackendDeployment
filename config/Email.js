const nodemailer = require("nodemailer");

// Create transporter with better timeout settings
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },
  // Add these to prevent timeout issues
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 10000,
  debug: true, // Enable debug output
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    console.log(`📧 Attempting to send email to: ${to}`);
    console.log(`Using SMTP server: smtp-relay.brevo.com:587`);
    
    const info = await transporter.sendMail({
      from: `"Dhun Music 🎵" <${process.env.BREVO_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);
    
    return info;
  } catch (error) {
    console.error("❌ Email Error Details:");
    console.error("Code:", error.code);
    console.error("Command:", error.command);
    console.error("Message:", error.message);
    
    if (error.response) {
      console.error("SMTP Response:", error.response);
    }
    
    throw new Error("Email not sent: " + error.message);
  }
};

module.exports = sendEmail;