const sgMail = require("@sendgrid/mail");


sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    console.log(`📧 Sending email to: ${to}`);

    const msg = {
      to,
      from: {
        name: "Dhun Music 🎵",
        email: process.env.EMAIL_FROM,
      },
      subject,
      html,
    };

    const response = await sgMail.send(msg);

    console.log("✅ Email sent successfully!");
    console.log("Status Code:", response[0].statusCode);
    console.log("Headers:", response[0].headers);

    return response;
  } catch (error) {
    console.error("❌ Email Error:");

    if (error.response) {
      console.error("Body:", error.response.body);
      console.error("Headers:", error.response.headers);
    } else {
      console.error(error.message);
    }

    throw new Error("Email not sent: " + error.message);
  }
};

module.exports = sendEmail;