const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // TLS
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD,
  },
  connectionTimeout: 10000, // ⏱️ increase timeout
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"Dhun Music 🎵" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent to:", to);
  } catch (error) {
    console.error("❌ Email Error:", error);
    throw new Error("Email not sent");
  }
};

module.exports = sendEmail;