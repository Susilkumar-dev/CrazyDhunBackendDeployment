const sendEmail = async ({ to, subject, html }) => {
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY, // ✅ API KEY (NOT SMTP)
      },
      body: JSON.stringify({
        sender: {
          name: "Dhun Music",
          email: process.env.BREVO_USER, // must be verified in Brevo
        },
        to: [{ email: to }],
        subject: subject,

        // ✅ IMPORTANT: both html + text
        htmlContent: html,
        textContent: "Your OTP from Dhun Music. If you didn’t request, ignore this email.",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Brevo Error:", data);
      throw new Error(data.message || "Email failed");
    }

    console.log("✅ Email sent successfully:", data);

  } catch (error) {
    console.error("❌ Email Error:", error.message);
    throw error;
  }
};

module.exports = sendEmail;