const express = require('express');
const router = express.Router();
const { 
  registerUser, verifyOtp, loginUser, getAllSongs, 
  getRecommendedSongs, getSongsByArtist, getSongsByLanguage, 
  forgotPassword, verifyResetOtp, resetPassword 
} = require('../../Controllers/publicController/PublicControllers');

// Authentication routes
router.post('/register', registerUser);
router.post('/verify-otp', verifyOtp);
router.post('/login', loginUser);

// Password reset routes - FIXED: Added missing routes
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);




// In your public routes
router.post('/test-email', async (req, res) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to yourself
            subject: 'Test Email from Dhun Music',
            text: 'This is a test email to verify SMTP configuration.'
        };
        
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: 'Test email sent successfully!' });
    } catch (error) {
        console.error('Test email error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send test email',
            error: error.message 
        });
    }
});

// Song routes
router.get('/songs', getAllSongs);
router.get('/songs/language/:language', getSongsByLanguage);
router.get('/songs/recommend/:songId', getRecommendedSongs);
router.get('/songs/artist/:artistName', getSongsByArtist);

module.exports = router;