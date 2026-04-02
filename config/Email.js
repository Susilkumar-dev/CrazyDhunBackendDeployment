const axios = require("axios");

const sendEmail = async ({ to, subject, html }) => {
  try {
    const res = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { email: process.env.BREVO_USER, name: "Dhun Music" },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          "api-key": process.env.BREVO_PASS,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Email sent:", res.data);
  } catch (error) {
    console.error("❌ Email API Error:", error.response?.data || error.message);
    throw error; // optional but useful
  }
};

module.exports = sendEmail;