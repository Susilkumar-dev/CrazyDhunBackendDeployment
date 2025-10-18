



const User = require("../../Models/userModel/userModel.js");
const Song = require("../../Models/songModel/songModel.js");
const bcrypt = require("bcrypt");
const generateToken = require("../../auth/jwt/generateToken");
const sgMail = require('@sendgrid/mail'); // Using SendGrid now

// Set the SendGrid API Key from your environment variables
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


//! REGISTER USER (Sends OTP) - FINAL LOGIC
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    
    try {
        // Check if a VERIFIED user already exists.
        const verifiedUserExists = await User.findOne({ email, isVerified: true });
        if (verifiedUserExists) {
            return res.status(400).json({ message: "An account with this email already exists." });
        }

        // If an unverified user exists, we'll overwrite their record for a new attempt.
        await User.deleteOne({ email, isVerified: false });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedPassword = await bcrypt.hash(password, 10);
        const hashedOtp = await bcrypt.hash(otp, 10);
        const otpExpires = Date.now() + 10 * 60 * 1000; // OTP is valid for 10 minutes


        await User.create({
            username,
            email,
            password: hashedPassword,
            otp: hashedOtp,
            otpExpires: otpExpires, 
            isVerified: false,
        });

        // Send the email AFTER creating the record
        const mailOptions = {
            to: email, 
            from: { name: 'Dhun Music', email: process.env.EMAIL_USER },
            subject: `Your Dhun Music Verification Code is ${otp}`,
            text: `Welcome to Dhun Music! Your verification code is ${otp}. This code is valid for 10 minutes.`,
            html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><h2>Welcome to Dhun Music!</h2><p>Your verification code is:</p><p style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${otp}</p><p>This code is valid for 10 minutes.</p></div>`
        };

        await sgMail.send(mailOptions);
        console.log("✅ OTP email sent and unverified user created for:", email);
        
        res.status(201).json({ message: "Registration successful, please check your email for OTP." });

    } catch (error) {
        console.error("❌ Registration error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

//! VERIFY OTP - FINAL LOGIC
const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email, isVerified: false });

        if (!user) {
            return res.status(404).json({ message: "No pending verification found for this email. Please register again." });
        }

        if (user.otpExpires < Date.now()) {
            await User.deleteOne({ _id: user._id }); // Clean up expired record
            return res.status(400).json({ message: "OTP has expired. Please register again." });
        }

        const isOtpMatch = await bcrypt.compare(otp, user.otp);
        if (!isOtpMatch) {
            return res.status(400).json({ message: "The OTP you entered is incorrect." });
        }

        // Success! Finalize the user's account.
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined; 
        await user.save();

        res.status(200).json({
            message: "Email verified successfully! Welcome to Dhun.",
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

//! LOGIN USER (No changes needed here)
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

//! GET ALL SONGS (No changes needed here)
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

//! GET RECOMMENDED SONGS (No changes needed here)
const getRecommendedSongs = async (req, res) => {
    try {
        const { songId } = req.params;
        const currentSong = await Song.findById(songId);
        if (!currentSong) return res.json([]);

        const recommendations = await Song.find({
            artist: currentSong.artist,
            _id: { $ne: songId }
        }).limit(10); 

        res.json(recommendations);
    } catch (error) {
        console.error("Recommendation error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

//! GET SONGS BY LANGUAGE (No changes needed here)
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

//! GET SONGS BY ARTIST (No changes needed here)
const getSongsByArtist = async (req, res) => {
  try {
    const artistName = req.params.artistName;
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

//! FORGOT PASSWORD - Send reset OTP - UPDATED
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({ 
                message: "If an account with this email exists, a password reset OTP has been sent." 
            });
        }

        const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const resetOtpExpiry = Date.now() + 3600000; // 1 hour
        
        user.resetOtp = resetOtp;
        user.resetOtpExpiry = resetOtpExpiry;
        await user.save();

        // Send email with OTP using SendGrid
        const mailOptions = {
            from: process.env.EMAIL_USER, // Your verified sender in SendGrid
            to: user.email,
            subject: 'Dhun Music - Password Reset OTP',
            text: `Your password reset OTP is: ${resetOtp}. This OTP will expire in 1 hour.`,
        };

        await sgMail.send(mailOptions);
            
        res.status(200).json({ 
            message: "If an account with this email exists, a password reset OTP has been sent.",
            email: user.email
        });

    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

//! VERIFY RESET OTP (No changes needed here)
const verifyResetOtp = async (req, res) => {
    const { email, otp } = req.body;
    
    try {
        const user = await User.findOne({ 
            email, 
            resetOtpExpiry: { $gt: Date.now() } 
        });

        if (!user || user.resetOtp !== otp) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        res.status(200).json({ 
            message: "OTP verified successfully",
            email: user.email
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

//! RESET PASSWORD (No changes needed here)
const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    
    try {
        const user = await User.findOne({ 
            email, 
            resetOtp: otp,
            resetOtpExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired OTP. Please try again." });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetOtp = undefined;
        user.resetOtpExpiry = undefined;
        
        await user.save();

        res.status(200).json({ message: "Password has been reset successfully." });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Export all the functions
module.exports = { 
    registerUser, 
    verifyOtp, 
    loginUser, 
    getAllSongs,
    getRecommendedSongs,
    getSongsByArtist,
    getSongsByLanguage,
    forgotPassword,
    verifyResetOtp,
    resetPassword 
};