const sgMail = require("@sendgrid/mail");

if (!process.env.SENDGRID_API_KEY) {
  console.error("❌ SENDGRID_API_KEY not found in .env");
  process.exit(1);
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    await sgMail.send({
      to,
      from: process.env.EMAIL_FROM,
      subject,
      html,
    });
    console.log("✅ Email sent to:", to);
  } catch (error) {
    console.error("❌ SendGrid Error:", error.response?.body || error);
    throw new Error("Email sending failed");
  }
};

module.exports = sendEmail;
