// const express = require('express');
// const urouter = express.Router();
// const { getUserProfile, updateUserProfile, deleteUserAccount, requestSong, getLikedSongs, likeSong, unlikeSong, getUserPlaylists, createPlaylist, getPlaylistById, addSongToPlaylist, deletePlaylist, updateUserPicture,  updatePlaylist, } = require('../../Controllers/userController/userController');
// const verifyToken = require('../../auth/role/authMiddleware');
// const { upload } = require('../../middleware/uploadMiddleware');

// urouter.get('/profile', verifyToken, getUserProfile);
// urouter.put('/profile/update', verifyToken, updateUserProfile);
// urouter.delete('/profile/delete', verifyToken, deleteUserAccount);
// urouter.put('/profile/picture', verifyToken, updateUserPicture);

// urouter.post('/songs/request',
//     verifyToken,
//     upload.fields([
//         { name: 'songFile', maxCount: 1 },
//         { name: 'coverArt', maxCount: 1 },
//         { name: 'artistPic', maxCount: 1 }
//     ]),
//     requestSong
// );


// // --- NEW ROUTES FOR LIKED SONGS ---
// urouter.get('/liked-songs', verifyToken, getLikedSongs);
// urouter.post('/like-song/:id', verifyToken, likeSong);
// urouter.delete('/unlike-song/:id', verifyToken, unlikeSong);


// // --- NEW ROUTES FOR PLAYLISTS ---
// urouter.get('/playlists', verifyToken, getUserPlaylists);
// urouter.post('/playlists', verifyToken, createPlaylist);
// urouter.get('/playlists/:id', verifyToken, getPlaylistById);
// urouter.post('/playlists/add-song', verifyToken, addSongToPlaylist);
// urouter.delete('/playlists/:id', verifyToken, deletePlaylist);
// urouter.put('/playlists/:id', verifyToken, updatePlaylist);






// module.exports = urouter;








const express = require('express');
const urouter = express.Router();
const { 
    getUserProfile, updateUserProfile, deleteUserAccount, requestSong, 
    getLikedSongs, likeSong, unlikeSong, getUserPlaylists, createPlaylist, 
    getPlaylistById, addSongToPlaylist, deletePlaylist, updateUserPicture,  
    updatePlaylist 
} = require('../../Controllers/userController/userController');
const verifyToken = require('../../auth/role/authMiddleware');
const { upload } = require('../../middleware/uploadMiddleware'); // ✅ ADD THIS

//! GET USER PROFILE
urouter.get('/profile', verifyToken, getUserProfile);
urouter.put('/profile/update', verifyToken, updateUserProfile);
urouter.delete('/profile/delete', verifyToken, deleteUserAccount);
urouter.put('/profile/picture', verifyToken, updateUserPicture);

// ✅ UPDATED ROUTE - ADD UPLOAD MIDDLEWARE (SAME AS ADMIN)
urouter.post('/songs/request', 
    verifyToken, 
    upload.fields([
        { name: 'songFile', maxCount: 1 },
        { name: 'coverArt', maxCount: 1 },
        { name: 'artistPic', maxCount: 1 }
    ]),
    requestSong
);

// --- LIKED SONGS ROUTES ---
urouter.get('/liked-songs', verifyToken, getLikedSongs);
urouter.post('/like-song/:id', verifyToken, likeSong);
urouter.delete('/unlike-song/:id', verifyToken, unlikeSong);

// --- PLAYLISTS ROUTES ---
urouter.get('/playlists', verifyToken, getUserPlaylists);
urouter.post('/playlists', verifyToken, createPlaylist);
urouter.get('/playlists/:id', verifyToken, getPlaylistById);
urouter.post('/playlists/add-song', verifyToken, addSongToPlaylist);
urouter.delete('/playlists/:id', verifyToken, deletePlaylist);
urouter.put('/playlists/:id', verifyToken, updatePlaylist);

module.exports = urouter;