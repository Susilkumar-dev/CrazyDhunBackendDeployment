const express = require('express');
const arouter = express.Router();
const {  
  updateSong, deleteSong, getAllUsers, deleteUser, changeUserRole, 
  loginAdmin, registerAdmin, getPendingSongs, rejectSong, approveSong, 
  createSongWithUrl, createSong, toggleSongStatus, getAllSongs // ✅ Add getAllSongs here
} = require('../../Controllers/adminController/adminControllers'); // ✅ Correct path
const checkRole = require('../../auth/role/checkRole');
const verifyToken = require("../../auth/role/authMiddleware");
const { upload } = require('../../middleware/uploadMiddleware');


// Admin song upload route
arouter.post(
    '/songs',
    verifyToken,
    checkRole('admin'),
    upload.fields([
        { name: 'songFile', maxCount: 1 },
        { name: 'coverArt', maxCount: 1 },
        { name: 'artistPic', maxCount: 1 }
    ]),
    createSong
);

// Add song by URL
arouter.post('/songs/add-by-url', verifyToken, checkRole('admin'), createSongWithUrl);

// Song management routes
arouter.get('/songs', verifyToken, checkRole('admin'), getAllSongs); 
arouter.put('/songs/:id', verifyToken, checkRole('admin'), updateSong);
arouter.delete('/songs/:id', verifyToken, checkRole('admin'), deleteSong);
arouter.patch('/songs/:id/status', verifyToken, checkRole('admin'), toggleSongStatus);

// Admin approval workflow
arouter.get('/songs/pending', verifyToken, checkRole('admin'), getPendingSongs);
arouter.post('/songs/approve/:id', verifyToken, checkRole('admin'), approveSong);
arouter.delete('/songs/reject/:id', verifyToken, checkRole('admin'), rejectSong);

// User management
arouter.get('/users', verifyToken, checkRole('admin'), getAllUsers);
arouter.delete('/users/:id', verifyToken, checkRole('admin'), deleteUser);
arouter.put('/users/role/:id', verifyToken, checkRole('admin'), changeUserRole);

// Admin authentication
arouter.post("/register", registerAdmin);
arouter.post("/login", loginAdmin);

module.exports = arouter;