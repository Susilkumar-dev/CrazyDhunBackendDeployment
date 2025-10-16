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

// Song routes
router.get('/songs', getAllSongs);
router.get('/songs/language/:language', getSongsByLanguage);
router.get('/songs/recommend/:songId', getRecommendedSongs);
router.get('/songs/artist/:artistName', getSongsByArtist);

module.exports = router;