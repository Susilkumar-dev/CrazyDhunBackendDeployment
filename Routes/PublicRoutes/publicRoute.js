const express = require('express');
const router = express.Router();
const { registerUser, verifyOtp, loginUser, getAllSongs, getRecommendedSongs, getSongsByArtist, getSongsByLanguage, forgotPassword, verifyResetOtp, resetPassword, getTrendingSongs} = require('../../Controllers/publicController/PublicControllers');

router.post('/register', registerUser);
router.post('/verify-otp', verifyOtp);
router.post('/login', loginUser);
router.get('/songs', getAllSongs);
router.get('/songs/language/:language', getSongsByLanguage);
router.get('/songs/recommend/:songId', getRecommendedSongs);
router.get('/songs/artist/:artistName', getSongsByArtist);
router.get('/songs/trending', getTrendingSongs);




router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);









module.exports = router;