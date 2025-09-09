const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "_" + file.originalname);
    }
});

// --- THIS IS THE CORRECTED FILE FILTER ---
const fileFilter = (req, file, cb) => {
    // A more comprehensive list of allowed audio mimetypes
    const allowedAudio = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav"];
    
    // A more comprehensive list of allowed image mimetypes
    const allowedImage = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

    if (file.fieldname === "songFile") {
        if (allowedAudio.includes(file.mimetype)) {
            cb(null, true); // Accept the audio file
        } else {
            // Reject with a specific error for audio
            cb(new Error("Invalid audio file type. Only MP3 and WAV are allowed."), false);
        }
    } else if (file.fieldname === "coverArt" || file.fieldname === "artistPic") {
        if (allowedImage.includes(file.mimetype)) {
            cb(null, true); // Accept the image file
        } else {
            // Reject with a specific error for images
            cb(new Error("Invalid image file type. Only JPG and PNG are allowed."), false);
        }
    } else {
        // Reject any other unexpected files
        cb(new Error("Unexpected file field in form data."), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { 
        fileSize: 10 * 1024 * 1024 // 10MB file size limit for songs
    }
});

module.exports = upload; 