const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    await sgMail.send({
      to,
      from: {
        name: "Dhun Music App",
        email: process.env.EMAIL_FROM
      },
      subject,
      html,
    });
  } catch (error) {
    console.error("SendGrid Error:", error.response?.body || error);

    throw new Error("Email not sent"); 
  }
};

module.exports = sendEmail;