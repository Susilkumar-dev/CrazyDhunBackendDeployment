const express = require('express');
const arouter = express.Router();
const {  updateSong, deleteSong, getAllUsers, deleteUser, changeUserRole, loginAdmin, registerAdmin, getPendingSongs, rejectSong, approveSong, createSongWithUrl } = require('../../Controllers/adminController/adminControllers');
const checkRole = require('../../auth/role/checkRole');

const verifyToken = require("../../auth/role/authMiddleware");
const upload = require('../../middleware/uploadMiddleware');



// Admin direct song creation
// arouter.post(
//     '/songs', // Kept it simple
//     verifyToken,
//     checkRole('admin'),
//     upload.fields([
//         { name: 'songFile', maxCount: 1 },
//         { name: 'coverArt', maxCount: 1 },
//         { name: 'artistPic', maxCount: 1 } // Add artistPic to multer
//     ]),
//     createSong
// );

// --- ROUTE 2: For the ADMIN to ADD BY URL ---
arouter.post('/songs/add-by-url', verifyToken, checkRole('admin'), createSongWithUrl);

arouter.put('/songs/:id', verifyToken, checkRole('admin'), updateSong);
arouter.delete('/songs/:id', verifyToken, checkRole('admin'), deleteSong);


// NEW ROUTES FOR ADMIN APPROVAL WORKFLOW
arouter.get('/songs/pending', verifyToken, checkRole('admin'), getPendingSongs);
arouter.post('/songs/approve/:id', verifyToken, checkRole('admin'), approveSong);
arouter.delete('/songs/reject/:id', verifyToken, checkRole('admin'), rejectSong);


arouter.post("/register", registerAdmin);
arouter.post("/login", loginAdmin);

arouter.get('/users', verifyToken, checkRole('admin'), getAllUsers);
arouter.delete('/users/:id', verifyToken, checkRole('admin'), deleteUser);
arouter.put('/users/role/:id', verifyToken, checkRole('admin'), changeUserRole);

module.exports = arouter;