
// const User = require("../../Models/userModel/userModel.js");
// const Song = require("../../Models/songModel/songModel.js");

// const bcrypt = require("bcrypt");
// const generateToken = require("../../auth/jwt/generateToken");
// const nodemailer = require("nodemailer");
// console.log("EMAIL_USER:", process.env.EMAIL_USER);
// console.log("EMAIL_PASS length:", process.env.EMAIL_PASS?.length);


// //! Nodemailer transporter
// const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 465,
//     secure: true,
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//     },
// });


// //! REGISTER USER (Sends OTP)
// //! REGISTER USER (Sends OTP)
// const registerUser = async (req, res) => {
//     const { username, email, password } = req.body;
    
//     console.log("📧 Registration attempt:", { username, email });
    
//     try {
//         const userExists = await User.findOne({ email });
//         if (userExists) {
//             console.log("❌ User already exists:", email);
//             return res.status(400).json({ message: "User with this email already exists" });
//         }

//         const otp = Math.floor(100000 + Math.random() * 900000).toString();
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const hashedOtp = await bcrypt.hash(otp, 10);

//         console.log("📨 Sending OTP email...");

//         const mailOptions = {
//             from: process.env.EMAIL_USER,
//             to: email,
//             subject: 'Your OTP for Dhun Music Verification',
//             text: `Welcome to Dhun! Your One-Time Password is: ${otp}`,
//         };

//         await transporter.sendMail(mailOptions);
//         console.log("✅ OTP email sent successfully");

//         await User.create({
//             username,
//             email,
//             password: hashedPassword,
//             otp: hashedOtp,
//             isVerified: false,
//         });

//         console.log("✅ User created in database");
//         res.status(201).json({ message: "Registration successful, please check your email for OTP." });

//     } catch (error) {
//         console.error("❌ Registration error:", error);
//         res.status(500).json({ message: error.message || "Server Error" });
//     }
// };
// //! VERIFY OTP
// const verifyOtp = async (req, res) => {
//     const { email, otp } = req.body;
//     try {
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(404).json({ message: "User not found." });
//         }
//         if (user.isVerified) {
//             return res.status(400).json({ message: "User is already verified." });
//         }

//         const isOtpMatch = await bcrypt.compare(otp, user.otp);
//         if (!isOtpMatch) {
//             return res.status(400).json({ message: "Invalid OTP." });
//         }


//         user.isVerified = true;
//         user.otp = undefined;
//         await user.save();

//         res.status(200).json({
//             message: "Email verified successfully! You can now log in.",
//             _id: user._id,
//             username: user.username,
//             email: user.email,
//             role: user.role,
//             token: generateToken(user._id, user.role),
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Server Error" });
//     }
// };

// //! LOGIN USER
// const loginUser = async (req, res) => {
//     const { email, password } = req.body;
//     try {
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(401).json({ message: "Invalid email or password" });
//         }

//         if (!user.isVerified) {
//             return res.status(403).json({ message: "Please verify your email before logging in." });
//         }

//         if (await bcrypt.compare(password, user.password)) {
//             res.json({
//                 message: "Login successful",
//                 userDetails: {
//                     _id: user._id,
//                     username: user.username,
//                     email: user.email,
//                     role: user.role,
//                     token: generateToken(user._id, user.role),
//                 }
//             });
//         } else {
//             res.status(401).json({ message: "Invalid email or password" });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Server Error" });
//     }
// };





// //! GET ALL SONGS (Public)
// const getAllSongs = async (req, res) => {
//     try {
//         const { language, genre, mood } = req.query;
//         let filter = {};
        
//         if (language) filter.language = language;
//         if (genre) filter.genre = genre;
//         if (mood) filter.mood = mood;
        
//         const songs = await Song.find(filter);
//         res.json(songs);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Server Error" });
//     }
// };

// // ---  Function to get recommended songs ---
// const getRecommendedSongs = async (req, res) => {
//     try {
//         const { songId } = req.params;
//         const currentSong = await Song.findById(songId);
//         if (!currentSong) return res.json([]);

//         // Simple Recommendation Logic: Find other songs by the same artist
//         // A more advanced system could use genre, album, or even AI/ML tags
//         const recommendations = await Song.find({
//             artist: currentSong.artist,
//             _id: { $ne: songId } // Exclude the current song itself
//         }).limit(10); // Limit to 10 recommendations

//         res.json(recommendations);
//     } catch (error) {
//         console.error("Recommendation error:", error);
//         res.status(500).json({ message: 'Server Error' });
//     }
// };


// // Add a new function to get songs by language
// const getSongsByLanguage = async (req, res) => {
//     try {
//         const { language } = req.params;
//         const songs = await Song.find({ language: { $regex: new RegExp(`^${language}$`, "i") } });
        
//         if (!songs || songs.length === 0) {
//             return res.status(404).json({ message: "No songs found for this language" });
//         }
        
//         res.json(songs);
//     } catch (error) {
//         console.error("Error fetching songs by language:", error);
//         res.status(500).json({ message: "Server Error" });
//     }
// };




// const getSongsByArtist = async (req, res) => {
//   try {
//     const artistName = req.params.artistName;

//     // Case-insensitive search using regex
//     const songs = await Song.find({
//       artist: { $regex: new RegExp(`^${artistName}$`, "i") }
//     });

//     if (!songs || songs.length === 0) {
//       return res.status(404).json({ message: "No songs found for this artist" });
//     }

//     res.json(songs);
//   } catch (error) {
//     console.error("Error fetching songs by artist:", error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };



// //! FORGOT PASSWORD - Send reset OTP
// //! FORGOT PASSWORD - Send reset OTP
// const forgotPassword = async (req, res) => {
//     const { email } = req.body;
    
//     try {
//         const user = await User.findOne({ email });
//         if (!user) {
//             // For security, don't reveal if email exists
//             return res.status(200).json({
//                 message: "If the email exists, a password reset OTP has been sent"
//             });
//         }

//         // Generate 6-digit OTP
//         const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
//         const resetOtpExpiry = Date.now() + 3600000; // 1 hour
        
//         // Store plain OTP (not hashed) for verification
//         user.resetOtp = resetOtp;
//         user.resetOtpExpiry = resetOtpExpiry;
//         await user.save();

//         // Send email with OTP
//         const mailOptions = {
//             from: process.env.EMAIL_USER,
//             to: user.email,
//             subject: 'Dhun Music - Password Reset OTP',
//             text: `Your password reset OTP is: ${resetOtp}. This OTP will expire in 1 hour.`,
//         };

//         await transporter.sendMail(mailOptions);
            
//         res.status(200).json({
//             message: "If the email exists, a password reset OTP has been sent",
//             email: user.email // Send back email for the reset password page
//         });

//     } catch (error) {
//         console.error("Forgot password error:", error);
//         res.status(500).json({ message: "Server Error" });
//     }
// };
// //! VERIFY RESET OTP
// const verifyResetOtp = async (req, res) => {
//     const { email, otp } = req.body;
    
//     try {
//         const user = await User.findOne({
//             email,
//             resetOtpExpiry: { $gt: Date.now() }
//         });

//         if (!user) {
//             return res.status(400).json({ message: "Invalid or expired OTP" });
//         }

//         if (user.resetOtp !== otp) {
//             return res.status(400).json({ message: "Invalid OTP" });
//         }

//         // OTP is valid
//         res.status(200).json({
//             message: "OTP verified successfully",
//             email: user.email
//         });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Server Error" });
//     }
// };

// //! RESET PASSWORD
// const resetPassword = async (req, res) => {
//     const { email, otp, newPassword } = req.body;
    
//     try {
//         const user = await User.findOne({
//             email,
//             resetOtp: otp,
//             resetOtpExpiry: { $gt: Date.now() }
//         });

//         if (!user) {
//             return res.status(400).json({ message: "Invalid or expired OTP" });
//         }

//         // Update password
//         user.password = await bcrypt.hash(newPassword, 10);
//         user.resetOtp = undefined;
//         user.resetOtpExpiry = undefined;
        
//         await user.save();

//         res.status(200).json({ message: "Password reset successfully" });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Server Error" });
//     }
// };


// module.exports = { registerUser, verifyOtp, loginUser, getAllSongs,getRecommendedSongs,getSongsByArtist,getSongsByLanguage ,  resetPassword,verifyResetOtp,forgotPassword };





const User = require("../../Models/userModel/userModel.js");
const Song = require("../../Models/songModel/songModel.js");
const bcrypt = require("bcrypt");
const generateToken = require("../../auth/jwt/generateToken");
const sgMail = require('@sendgrid/mail'); // Using SendGrid now

// Set the SendGrid API Key from your environment variables
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//! REGISTER USER (Sends OTP) - UPDATED
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    
    console.log("📧 Registration attempt:", { username, email });
    
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            console.log("❌ User with this email already exists:", email);
            return res.status(400).json({ message: "User with this email already exists" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedPassword = await bcrypt.hash(password, 10);
        const hashedOtp = await bcrypt.hash(otp, 10);

        console.log("📨 Sending OTP email via SendGrid...");

        // Define the email message for SendGrid
        const mailOptions = {
        to: email, 
        from: {
            name: 'Dhun Music', // Add a professional sender name
            email: process.env.EMAIL_USER // This should be your verified rajususil9@gmail.com
        },
        subject: `Your Dhun Music Verification Code is ${otp}`,
        // Add a plain text version for older email clients
        text: `Welcome to Dhun Music! Your verification code is ${otp}. This code is valid for 10 minutes.`,
        // Make the HTML version look much better
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2>Welcome to Dhun Music!</h2>
                <p>Thank you for registering. Please use the following verification code to complete your signup.</p>
                <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; background-color: #f2f2f2; padding: 10px 15px; display: inline-block; border-radius: 5px;">
                    ${otp}
                </p>
                <p>This code is valid for the next 10 minutes.</p>
                <hr style="border: none; border-top: 1px solid #eee;" />
                <p style="font-size: 0.9em; color: #777;">If you did not request this email, you can safely ignore it.</p>
            </div>
        `,
    };

    await sgMail.send(mailOptions);
        console.log("✅ OTP email sent successfully to", email);

        await User.create({
            username,
            email,
            password: hashedPassword,
            otp: hashedOtp,
            isVerified: false,
        });

        console.log("✅ User created in database");
        res.status(201).json({ message: "Registration successful, please check your email for OTP." });

    } catch (error) {
        console.error("❌ Registration error:", error);
        // SendGrid provides more detailed errors in the response body
        if (error.response) {
            console.error("SendGrid Error Body:", error.response.body);
        }
        res.status(500).json({ message: error.message || "Server Error" });
    }
};

//! VERIFY OTP (No changes needed here)
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