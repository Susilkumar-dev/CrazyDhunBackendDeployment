
const User = require("../../Models/userModel/userModel.js");
const Song = require("../../Models/songModel/songModel.js");
const Playlist = require("../../Models/playlistModel/playlistModel.js");
const PendingSong = require("../../Models/pendingModel/pendingSongModel.js");
const bcrypt = require("bcrypt");

// (getUserProfile, updateUserProfile, deleteUserAccount functions remain the same)
 //! GET USER PROFILE
const getUserProfile = async (req, res) => {
    res.json(req.user);
};

//! UPDATE USER PROFILE
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.username = req.body.username || user.username;
        user.bio = req.body.bio || user.bio;
        if (req.body.password) {
            user.password = await bcrypt.hash(req.body.password, 10);
        }

        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            role: updatedUser.role,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

//! DELETE USER ACCOUNT
const deleteUserAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        await user.deleteOne();
        res.json({ message: "User account deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};



// UPDATED: Function for a user to request adding a song
const requestSong = async (req, res) => {
    // THIS IS THE FIX: Add a safety check for req.user
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Not authorized. Please log in again." });
    }

    const { title, artist, album, filePath, coverArtPath } = req.body;
    try {
        await PendingSong.create({
            title, artist, album, filePath, coverArtPath,
            submittedBy: req.user.id, // Now this is safe to use
        });
        res.status(201).json({ message: "Song submitted successfully! It is now awaiting admin approval." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// --- NEW FUNCTIONS FOR LIKED SONGS ---

// GET a user's liked songs
const getLikedSongs = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('likedSongs');
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user.likedSongs);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// ADD a song to liked songs
const likeSong = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const songId = req.params.id;

        // Add the song ID to the array if it's not already there
        if (!user.likedSongs.includes(songId)) {
            user.likedSongs.push(songId);
            await user.save();
        }
        res.json({ message: "Song liked successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// REMOVE a song from liked songs
const unlikeSong = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const songId = req.params.id;

        // Pull (remove) the song ID from the array
        user.likedSongs.pull(songId);
        await user.save();
        
        res.json({ message: "Song unliked successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};




// --- NEW FUNCTIONS FOR PLAYLISTS ---

// CREATE a new playlist
const createPlaylist = async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Playlist name is required" });
    try {
        const newPlaylist = new Playlist({ name, owner: req.user.id });
        await newPlaylist.save();
        res.status(201).json(newPlaylist);
    } catch (error) { res.status(500).json({ message: "Server Error" }); }
};

// GET all playlists for the logged-in user
const getUserPlaylists = async (req, res) => {
    try {
        const playlists = await Playlist.find({ owner: req.user.id });
        res.json(playlists);
    } catch (error) { res.status(500).json({ message: "Server Error" }); }
};

// GET a single playlist by its ID, with all its songs populated
const getPlaylistById = async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id).populate('songs');
        if (!playlist) return res.status(404).json({ message: "Playlist not found" });
        // Security check: Make sure the user requesting the playlist is the owner
        if (playlist.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }
        res.json(playlist);
    } catch (error) { res.status(500).json({ message: "Server Error" }); }
};

// ADD a song to a specific playlist
const addSongToPlaylist = async (req, res) => {
    const { playlistId, songId } = req.body;
    try {
        const playlist = await Playlist.findById(playlistId);
        const song = await Song.findById(songId);

        if (!playlist || !song) return res.status(404).json({ message: "Playlist or song not found" });
        if (playlist.owner.toString() !== req.user.id) return res.status(403).json({ message: "Not authorized" });

        // Prevent adding duplicate songs
        if (playlist.songs.includes(songId)) {
            return res.status(400).json({ message: "Song already in playlist" });
        }

        playlist.songs.push(songId);
        // If this is the first song, set its cover art as the playlist cover
        if (playlist.songs.length === 1) {
            playlist.coverArt = song.coverArtPath;
        }
        await playlist.save();
        res.json(playlist);
    } catch (error) { res.status(500).json({ message: "Server Error" }); }
};

// --- NEW: Function to DELETE a playlist ---
const deletePlaylist = async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id);

        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found" });
        }

        // Security Check: Make sure the user trying to delete is the owner of the playlist
        if (playlist.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to delete this playlist" });
        }

        await playlist.deleteOne();
        res.json({ message: "Playlist deleted successfully" });
        
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// --- NEW: Function to UPDATE Profile Picture ---
const updateUserPicture = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // The request body will contain the new URL from Cloudinary
        const { imageUrl } = req.body;
        if (!imageUrl) return res.status(400).json({ message: "Image URL is required" });

        user.profilePicture = imageUrl;
        await user.save();
        
        // Return the updated user profile (excluding password)
        const updatedProfile = await User.findById(req.user.id).select('-password');
        res.json(updatedProfile);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = { getUserProfile, updateUserProfile, deleteUserAccount, requestSong, getLikedSongs, likeSong, unlikeSong,createPlaylist, getUserPlaylists, getPlaylistById, addSongToPlaylist,deletePlaylist,updateUserPicture };