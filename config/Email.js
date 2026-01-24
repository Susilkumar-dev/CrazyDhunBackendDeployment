const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  const msg = {
    to,
    // Change this line to include a specific Name
    from: {
      name: "Dhun Music App", 
      email: process.env.EMAIL_FROM 
    },
    subject,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log("Email sent to:", to);
  } catch (error) {
    console.error("SendGrid Error:", error.response ? error.response.body : error);
  }
};

module.exports = sendEmail;