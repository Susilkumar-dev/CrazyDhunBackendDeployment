



const multer = require('multer');
const path = require('path');

// Use memory storage for Cloudinary uploads
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
    const allowedAudio = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav"];
    const allowedImage = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];

    if (file.fieldname === "songFile") {
        if (allowedAudio.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid audio file type. Only MP3 and WAV are allowed."), false);
        }
    } else if (file.fieldname === "coverArt" || file.fieldname === "artistPic") {
        if (allowedImage.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid image file type. Only JPG, PNG, and WEBP are allowed."), false);
        }
    } else {
        cb(new Error("Unexpected file field in form data."), false);
    }
};

// Multer upload configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { 
        fileSize: 20 * 1024 * 1024 // 20MB file size limit
    }
});

// Error handling middleware
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File too large. Maximum size is 20MB.' });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ message: 'Unexpected file field.' });
        }
    }
    res.status(400).json({ message: err.message });
};

module.exports = { upload, handleMulterError };