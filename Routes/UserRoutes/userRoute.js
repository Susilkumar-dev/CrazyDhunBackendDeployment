const express = require('express');
const urouter = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  updateUserPicture,
  requestSong,
  getLikedSongs,
  likeSong,
  unlikeSong,
  getUserPlaylists,
  createPlaylist,
  getPlaylistById,
  addSongToPlaylist,
  deletePlaylist
} = require('../../Controllers/userController/userController');
const verifyToken = require('../../auth/role/authMiddleware');
const { upload } = require('../../middleware/uploadMiddleware');

// Update the route to include Multer middleware
urouter.post('/songs/request', verifyToken, upload.fields([
  { name: 'songFile', maxCount: 1 },
  { name: 'coverArt', maxCount: 1 },
  { name: 'artistPic', maxCount: 1 }
]), requestSong);

urouter.get('/profile', verifyToken, getUserProfile);
urouter.put('/profile/update', verifyToken, updateUserProfile);
urouter.delete('/profile/delete', verifyToken, deleteUserAccount);
urouter.put('/profile/picture', verifyToken, updateUserPicture);

// --- NEW ROUTES FOR LIKED SONGS ---
urouter.get('/liked-songs', verifyToken, getLikedSongs);
urouter.post('/like-song/:id', verifyToken, likeSong);
urouter.delete('/unlike-song/:id', verifyToken, unlikeSong);

// --- NEW ROUTES FOR PLAYLISTS ---
urouter.get('/playlists', verifyToken, getUserPlaylists);
urouter.post('/playlists', verifyToken, createPlaylist);
urouter.get('/playlists/:id', verifyToken, getPlaylistById);
urouter.post('/playlists/add-song', verifyToken, addSongToPlaylist);
urouter.delete('/playlists/:id', verifyToken, deletePlaylist);

module.exports = urouter;