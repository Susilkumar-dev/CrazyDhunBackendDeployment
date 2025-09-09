


// --- 1. CORRECTED MODEL IMPORTS ---
// --- 1. CORRECTED MODEL IMPORTS TO MATCH YOUR FOLDER STRUCTURE ---
const Song = require('../../Models/songModel/songModel.js');
const User = require('../../Models/userModel/userModel.js');
const PendingSong = require('../../Models/pendingModel/pendingSongModel.js');
const cloudinary = require('../../config/cloudinary.js');
const bcrypt = require("bcrypt"); // Using bcryptjs for consistency
const generateToken = require("../../auth/jwt/generateToken.js");

// --- 2. ADMIN REGISTRATION & LOGIN (Using the single User model) ---
const registerAdmin = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "An account with this email already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user but explicitly set their role to 'admin'
        const admin = await User.create({
            username,
            email,
            password: hashedPassword,
            role: 'admin',
            isVerified: true, // Admins are verified by default
        });

        res.status(201).json({
            _id: admin._id,
            username: admin.username,
            email: admin.email,
            role: admin.role,
            token: generateToken(admin._id, admin.role)
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error: " + error.message });
    }
};

const loginAdmin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = await User.findOne({ email });
        // Check if the user exists AND if their role is 'admin'
        if (!admin || admin.role !== 'admin') {
            return res.status(401).json({ message: "Invalid credentials or not an admin" });
        }
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials or not an admin" });
        }
        res.json({
            _id: admin._id,
            username: admin.username,
            email: admin.email,
            role: admin.role,
            token: generateToken(admin._id, admin.role)
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error: " + error.message });
    }
};

// This function handles the ADMIN'S FILE UPLOAD workflow
// const createSong = async (req, res) => {
//     const { title, artist, album } = req.body;
//     try {
//         if (!req.files || !req.files.songFile || !req.files.coverArt || !req.files.artistPic) {
//             return res.status(400).json({ message: 'Song, cover art, and artist picture files are all required' });
//         }
//         // Upload all three files to Cloudinary in parallel for speed
//         const [songResult, coverArtResult, artistPicResult] = await Promise.all([
//             cloudinary.uploader.upload(req.files.songFile[0].path, { resource_type: "video" }),
//             cloudinary.uploader.upload(req.files.coverArt[0].path, { resource_type: "image" }),
//             cloudinary.uploader.upload(req.files.artistPic[0].path, { resource_type: "image" })
//         ]);

//         const song = new Song({
//             title,
//             artist,
//             album,
//             filePath: songResult.secure_url,
//             coverArtPath: coverArtResult.secure_url,
//             artistPic: artistPicResult.secure_url, // Save the artist pic URL
//         });
//         const createdSong = await song.save();
//         res.status(201).json(createdSong);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Server Error during file upload" });
//     }
// };

// --- FUNCTION 2: Handles URL PASTING from the admin ---
const createSongWithUrl = async (req, res) => {
    const { title, artist, album, filePath, coverArtPath, artistPic } = req.body;
    try {
        if (!title || !filePath || !coverArtPath || !artistPic) {
            return res.status(400).json({ message: 'All URLs are required' });
        }
        const song = new Song({ title, artist, album, filePath, coverArtPath, artistPic });
        const createdSong = await song.save();
        res.status(201).json(createdSong);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// --- THIS IS THE CORRECTED APPROVAL FUNCTION ---
const approveSong = async (req, res) => {
    try {
        const pendingSong = await PendingSong.findById(req.params.id);
        if (!pendingSong) {
            return res.status(404).json({ message: 'Pending song not found' });
        }

        // THE FIX: Create the new Song by explicitly copying every field.
        // This is the most reliable way to ensure all data, especially the Cloudinary URLs, is transferred.
        const newSong = new Song({
            title: pendingSong.title,
            artist: pendingSong.artist,
            album: pendingSong.album,
            filePath: pendingSong.filePath,           // This ensures the song URL is copied
            coverArtPath: pendingSong.coverArtPath,
            artistPic: pendingSong.artistPic, // This ensures the image URL is copied
        });

        // Save the new, approved song to the main 'songs' collection
        await newSong.save();

        // Finally, remove the song from the 'pendingSongs' collection
        await pendingSong.deleteOne();

        res.json({ message: 'Song approved and added to the library.' });
    } catch (error) {
        console.error("Error approving song:", error);
        res.status(500).json({ message: 'Server Error during approval' });
    }
};

// (All other functions remain the same)
const getPendingSongs = async (req, res) => {
    try {
        const pendingSongs = await PendingSong.find({}).populate('submittedBy', 'username');
        res.json(pendingSongs);
    } catch (error) {
        res.status(500).json({ message: 'Server Error getting pending songs' });
    }
};

const rejectSong = async (req, res) => {
    try {
        const pendingSong = await PendingSong.findById(req.params.id);
        if (pendingSong) {
            await pendingSong.deleteOne();
            res.json({ message: 'Song request rejected and removed.' });
        } else {
            res.status(404).json({ message: 'Pending song not found' });
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error rejecting song" });
    }
};

// --- 5. GENERAL MANAGEMENT FUNCTIONS ---
const updateSong = async (req, res) => {
    const { title, artist, album } = req.body;
    try {
        const song = await Song.findById(req.params.id);
        if (!song) return res.status(404).json({ message: 'Song not found' });
        song.title = title || song.title;
        song.artist = artist || song.artist;
        song.album = album || song.album;
        const updatedSong = await song.save();
        res.json(updatedSong);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

const deleteSong = async (req, res) => {
    try {
        const song = await Song.findById(req.params.id);
        if (song) {
            await song.deleteOne();
            res.json({ message: 'Song removed' });
        } else {
            res.status(404).json({ message: 'Song not found' });
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

const changeUserRole = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.role = user.role === 'admin' ? 'user' : 'admin';
        await user.save();
        res.json({ message: `User role updated to ${user.role}` });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    registerAdmin,
    loginAdmin,
    // createSong,
    getPendingSongs,
    approveSong,
    rejectSong,
    updateSong,
    deleteSong,
    getAllUsers,
    deleteUser,
    changeUserRole,
     createSongWithUrl, 
};