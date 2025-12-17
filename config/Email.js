// config/Email.js - NEW VERSION
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, text, html) => {
    try {
        const msg = {
            to,
            from: {
                email: process.env.EMAIL_USER,
                name: 'Dhun Music'
            },
            subject,
            text,
            html: html || `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; color: white;">
                        <h1>Dhun Music</h1>
                    </div>
                    <div style="padding: 20px; background: #f9f9f9;">
                        ${html || <p style="font-size: 16px; color: #333;">${text}</p>}
                    </div>
                    <div style="padding: 20px; text-align: center; background: #eee;">
                        <p style="color: #666; font-size: 12px;">
                            This email was sent from Dhun Music. Please do not reply to this email.
                        </p>
                    </div>
                </div>
            `
        };

        await sgMail.send(msg);
        console.log('✅ Email sent successfully to:', to);
        return true;
    } catch (error) {
        console.error('❌ Email sending failed:', error);
        if (error.response) {
            console.error('SendGrid error details:', error.response.body);
        }
        return false;
    }
};

module.exports = { sendEmail };