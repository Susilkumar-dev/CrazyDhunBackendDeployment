
const User = require("../../Models/userModel/userModel.js");
const Song = require("../../Models/songModel/songModel.js");

const bcrypt = require("bcrypt");
const generateToken = require("../../auth/jwt/generateToken");
const nodemailer = require("nodemailer");
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS length:", process.env.EMAIL_PASS?.length);


//! Nodemailer transporter 
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, 
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
    },
});


//! REGISTER USER (Sends OTP)
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
        const hashedPassword = await bcrypt.hash(password, 10);
        const hashedOtp = await bcrypt.hash(otp, 10);

        await User.create({
            username,
            email,
            password: hashedPassword,
            otp: hashedOtp,
            isVerified: false,
        });
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP for Dhun Music Verification',
            text: `Welcome to Dhun! Your One-Time Password is: ${otp}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Email send error:", error); 
                return res.status(500).json({ message: "Error sending OTP email" });
            }
            console.log("Email sent: " + info.response);
            res.status(201).json({ message: "Registration successful, please check your email for OTP." });
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

//! VERIFY OTP
const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        if (user.isVerified) {
            return res.status(400).json({ message: "User is already verified." });
        }

        const isOtpMatch = await bcrypt.compare(otp, user.otp);
        if (!isOtpMatch) {
            return res.status(400).json({ message: "Invalid OTP." });
        }


        user.isVerified = true;
        user.otp = undefined; 
        await user.save();

        res.status(200).json({
            message: "Email verified successfully! You can now log in.",
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

//! LOGIN USER
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        if (!user.isVerified) {
            return res.status(403).json({ message: "Please verify your email before logging in." });
        }

        if (await bcrypt.compare(password, user.password)) {
            res.json({
                message: "Login successful",
                userDetails: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user._id, user.role),
                }
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

//! GET ALL SONGS (Public)
const getAllSongs = async (req, res) => {
    try {
        const { language, genre, mood } = req.query;
        let filter = {};
        
        if (language) filter.language = language;
        if (genre) filter.genre = genre;
        if (mood) filter.mood = mood;
        
        const songs = await Song.find(filter);
        res.json(songs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// --- NEW: Function to get recommended songs ---
const getRecommendedSongs = async (req, res) => {
    try {
        const { songId } = req.params;
        const currentSong = await Song.findById(songId);
        if (!currentSong) return res.json([]);

        // Simple Recommendation Logic: Find other songs by the same artist
        // A more advanced system could use genre, album, or even AI/ML tags
        const recommendations = await Song.find({
            artist: currentSong.artist,
            _id: { $ne: songId } // Exclude the current song itself
        }).limit(10); // Limit to 10 recommendations

        res.json(recommendations);
    } catch (error) {
        console.error("Recommendation error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};


// Add a new function to get songs by language
const getSongsByLanguage = async (req, res) => {
    try {
        const { language } = req.params;
        const songs = await Song.find({ language: { $regex: new RegExp(`^${language}$`, "i") } });
        
        if (!songs || songs.length === 0) {
            return res.status(404).json({ message: "No songs found for this language" });
        }
        
        res.json(songs);
    } catch (error) {
        console.error("Error fetching songs by language:", error);
        res.status(500).json({ message: "Server Error" });
    }
};


// / --- NEW: Function to get all songs by a specific artist ---
// const getSongsByArtist = async (req, res) => {
//     try {
//         const artistName = req.params.artistName;
//         const songs = await Song.find({ artist: artistName });
//         if (!songs || songs.length === 0) {
//             return res.status(404).json({ message: "No songs found for this artist" });
//         }
//         res.json(songs);
//     } catch (error) {
//         res.status(500).json({ message: "Server Error" });
//     }
// };

const getSongsByArtist = async (req, res) => {
  try {
    const artistName = req.params.artistName;

    // Case-insensitive search using regex
    const songs = await Song.find({
      artist: { $regex: new RegExp(`^${artistName}$`, "i") }
    });

    if (!songs || songs.length === 0) {
      return res.status(404).json({ message: "No songs found for this artist" });
    }

    res.json(songs);
  } catch (error) {
    console.error("Error fetching songs by artist:", error);
    res.status(500).json({ message: "Server Error" });
  }
};




module.exports = { registerUser, verifyOtp, loginUser, getAllSongs,getRecommendedSongs,getSongsByArtist,getSongsByLanguage };