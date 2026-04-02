const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html }) => {
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { 
          name: "Dhun Music", 
          email: process.env.BREVO_USER  // rajususil45@gmail.com
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Email failed");
    }

    console.log("✅ Email sent!");

  } catch (error) {
    console.error("❌ Email Error:", error.message);
    throw error;
  }
};

module.exports = sendEmail;