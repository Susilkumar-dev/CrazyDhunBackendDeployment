const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",   // ✅ Brevo SMTP
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,  // ✅ your Brevo email
    pass: process.env.BREVO_PASS,  // ✅ your SMTP key
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"Dhun Music 🎵" <${process.env.BREVO_USER}>`,
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