const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    otp: String,
    isVerified: { type: Boolean, default: false },
    bio: { type: String, default: '' },
    profilePicture: { type: String, default: '' },
    likedSongs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
    resetOtp: String,
    resetOtpExpiry: Date

}, { timestamps: true });

const SongSchema = new mongoose.Schema({
    title: String,
    artist: String,
    album: String,
    filePath: String,
    coverArtPath: String,
    artistPic: String,
    viewCount: { type: Number, default: 0 },
    mood: { type: String, enum: ['High Energy', 'Chill', 'Focus', 'Happy', 'Sad'], default: 'Happy' },
    language: { type: String, default: '' },
    genre: { type: String, default: '' },
    tags: { type: String, default: '' },
    releaseDate: { type: Date }, 
    status: { type: Boolean, default: true } 
}, { timestamps: true });

const PendingSongSchema = new mongoose.Schema({
    title: String, artist: String, album: String,
    filePath: String, coverArtPath: String, artistPic: String,
    language: { type: String, default: '' },
    genre: { type: String, default: '' },
    tags: { type: String, default: '' },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const PlaylistSchema = new mongoose.Schema({
    name: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
    coverArt: { type: String, default: 'https://via.placeholder.com/160' }
}, { timestamps: true });

module.exports = { UserSchema, SongSchema, PendingSongSchema, PlaylistSchema };