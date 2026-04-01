// const User = require("../../Models/userModel/userModel.js");
// const Song = require("../../Models/songModel/songModel.js");
// const bcrypt = require("bcrypt");
// const generateToken = require("../../auth/jwt/generateToken");
// const sendEmail = require("../../config/Email.js");


// //! REGISTER USER (Sends OTP via SendGrid)
// const registerUser = async (req, res) => {
//   const { username, email, password } = req.body;

//   try {
//     const verifiedUser = await User.findOne({ email, isVerified: true });
//     if (verifiedUser) {
//       return res.status(400).json({ message: "Email already registered" });
//     }

//     await User.deleteOne({ email, isVerified: false });

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const hashedOtp = await bcrypt.hash(otp, 10);

//     await User.create({
//       username,
//       email,
//       password: hashedPassword,
//       otp: hashedOtp,
//       otpExpires: Date.now() + 10 * 60 * 1000,
//       isVerified: false,
//     });

// await sendEmail({
//   to: email,
//   subject: "Dhun Music Verification Code",
//   html: `
//     <h2>Welcome to Dhun Music 🎵</h2>
//     <p>Your OTP is:</p>
//     <h1>${otp}</h1>
//     <p>Valid for 10 minutes</p>
//   `,
// });


//     res.status(201).json({
//       message: "Registration successful. OTP sent.",
//       email,
//     });

//   } catch (error) {
//     console.error("Register error:", error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };

// //! VERIFY OTP
// const verifyOtp = async (req, res) => {
//   const { email, otp } = req.body;

//   try {
//     const user = await User.findOne({ email, isVerified: false });

//     if (!user) {
//       return res.status(404).json({
//         message: "No pending verification found for this email. Please register again."
//       });
//     }

//     if (user.otpExpires < Date.now()) {
//       await User.deleteOne({ _id: user._id });
//       return res.status(400).json({ message: "OTP has expired. Please register again." });
//     }

//     const isOtpMatch = await bcrypt.compare(otp, user.otp);
//     if (!isOtpMatch) {
//       return res.status(400).json({ message: "The OTP you entered is incorrect." });
//     }

//     user.isVerified = true;
//     user.otp = undefined;
//     user.otpExpires = undefined;
//     await user.save();

//     res.status(200).json({
//       message: "Email verified successfully! Welcome to Dhun.",
//       _id: user._id,
//       username: user.username,
//       email: user.email,
//       role: user.role,
//       token: generateToken(user._id, user.role),
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };

// //! LOGIN USER
// const loginUser = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(401).json({ message: "Invalid email or password" });
//     }

//     if (!user.isVerified) {
//       return res.status(403).json({ message: "Please verify your email before logging in." });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid email or password" });
//     }

//     res.json({
//       message: "Login successful",
//       userDetails: {
//         _id: user._id,
//         username: user.username,
//         email: user.email,
//         role: user.role,
//         token: generateToken(user._id, user.role),
//       }
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };

// //! FORGOT PASSWORD (SendGrid)
// const forgotPassword = async (req, res) => {
//   const { email } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     const responseMessage =
//       "If an account with this email exists, a password reset OTP has been sent.";

//     if (!user) {
//       return res.status(200).json({ message: responseMessage });
//     }

//     const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();

//     user.resetOtp = resetOtp;
//     user.resetOtpExpiry = Date.now() + 60 * 60 * 1000;
//     await user.save();

//     await sendEmail({
//   to: email,
//   subject: "Dhun Music - Password Reset OTP",
//   html: `
//     <h2>Password Reset Request</h2>
//     <p>Your OTP is:</p>
//     <h1>${resetOtp}</h1>
//     <p>This OTP is valid for 1 hour.</p>
//   `,
// });

//     res.status(200).json({ message: responseMessage });

//   } catch (error) {
//     console.error("Forgot password error:", error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };

// //! VERIFY RESET OTP
// const verifyResetOtp = async (req, res) => {
//   const { email, otp } = req.body;

//   try {
//     const user = await User.findOne({
//       email,
//       resetOtpExpiry: { $gt: Date.now() }
//     });

//     if (!user || user.resetOtp !== otp) {
//       return res.status(400).json({ message: "Invalid or expired OTP" });
//     }

//     res.status(200).json({
//       message: "OTP verified successfully",
//       email: user.email
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };

// //! RESET PASSWORD
// const resetPassword = async (req, res) => {
//   const { email, otp, newPassword } = req.body;

//   try {
//     const user = await User.findOne({
//       email,
//       resetOtp: otp,
//       resetOtpExpiry: { $gt: Date.now() }
//     });

//     if (!user) {
//       return res.status(400).json({
//         message: "Invalid or expired OTP. Please try again."
//       });
//     }

//     user.password = await bcrypt.hash(newPassword, 10);
//     user.resetOtp = undefined;
//     user.resetOtpExpiry = undefined;
//     await user.save();

//     res.status(200).json({ message: "Password has been reset successfully." });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };

// //! SONG CONTROLLERS (UNCHANGED)
// const getAllSongs = async (req, res) => {
//   try {
//     const { language, genre, mood } = req.query;
//     let filter = {};
//     if (language) filter.language = language;
//     if (genre) filter.genre = genre;
//     if (mood) filter.mood = mood;

//     const songs = await Song.find(filter);
//     res.json(songs);
//   } catch (error) {
//     res.status(500).json({ message: "Server Error" });
//   }
// };

// const getRecommendedSongs = async (req, res) => {
//   try {
//     const { songId } = req.params;
//     const currentSong = await Song.findById(songId);
//     if (!currentSong) return res.json([]);

//     const recommendations = await Song.find({
//       artist: currentSong.artist,
//       _id: { $ne: songId }
//     }).limit(10);

//     res.json(recommendations);
//   } catch (error) {
//     res.status(500).json({ message: "Server Error" });
//   }
// };

// const getSongsByLanguage = async (req, res) => {
//   try {
//     const { language } = req.params;
//     const songs = await Song.find({
//       language: { $regex: new RegExp(`^${language}$`, "i") }
//     });

//     if (!songs.length) {
//       return res.status(404).json({ message: "No songs found" });
//     }

//     res.json(songs);
//   } catch (error) {
//     res.status(500).json({ message: "Server Error" });
//   }
// };

// const getSongsByArtist = async (req, res) => {
//   try {
//     const artistName = req.params.artistName;
//     const songs = await Song.find({
//       artist: { $regex: new RegExp(`^${artistName}$`, "i") }
//     });

//     if (!songs.length) {
//       return res.status(404).json({ message: "No songs found" });
//     }

//     res.json(songs);
//   } catch (error) {
//     res.status(500).json({ message: "Server Error" });
//   }
// };

// module.exports = {
//   registerUser,
//   verifyOtp,
//   loginUser,
//   forgotPassword,
//   verifyResetOtp,
//   resetPassword,
//   getAllSongs,
//   getRecommendedSongs,
//   getSongsByArtist,
//   getSongsByLanguage
// };





const User = require("../../Models/userModel/userModel.js");
const Song = require("../../Models/songModel/songModel.js");
const bcrypt = require("bcrypt");
const generateToken = require("../../auth/jwt/generateToken");
const sendEmail = require("../../config/Email.js");

//! REGISTER USER
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const verifiedUser = await User.findOne({ email, isVerified: true });
    if (verifiedUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    await User.deleteOne({ email, isVerified: false });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedOtp = await bcrypt.hash(otp, 10);

    await User.create({
      username,
      email,
      password: hashedPassword,
      otp: hashedOtp,
      otpExpires: Date.now() + 10 * 60 * 1000,
      isVerified: false,
    });

    // ✅ Email send (safe)
    try {
      await sendEmail({
        to: email,
        subject: "Dhun Music Verification Code",
        html: `
          <h2>Welcome to Dhun Music 🎵</h2>
          <p>Your OTP is:</p>
          <h1>${otp}</h1>
          <p>Valid for 10 minutes</p>
        `,
      });
    } catch (emailError) {
      console.error("Register Email failed:", emailError.message);
    }

    res.status(201).json({
      message: "Registration successful. OTP sent.",
      email,
    });

  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

//! VERIFY OTP
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email, isVerified: false });

    if (!user) {
      return res.status(404).json({
        message: "No pending verification found. Please register again."
      });
    }

    if (user.otpExpires < Date.now()) {
      await User.deleteOne({ _id: user._id });
      return res.status(400).json({ message: "OTP expired. Register again." });
    }

    const isOtpMatch = await bcrypt.compare(otp, user.otp);
    if (!isOtpMatch) {
      return res.status(400).json({ message: "Incorrect OTP." });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({
      message: "Email verified successfully!",
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
      return res.status(403).json({
        message: "Please verify your email first."
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

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

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

//! FORGOT PASSWORD
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    const responseMessage =
      "If an account exists, a reset OTP has been sent.";

    if (!user) {
      return res.status(200).json({ message: responseMessage });
    }

    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOtp = resetOtp;
    user.resetOtpExpiry = Date.now() + 60 * 60 * 1000;
    await user.save();

    // ✅ Email send (safe)
    try {
      await sendEmail({
        to: email,
        subject: "Dhun Music - Password Reset OTP",
        html: `
          <h2>Password Reset Request</h2>
          <p>Your OTP is:</p>
          <h1>${resetOtp}</h1>
          <p>Valid for 1 hour</p>
        `,
      });
    } catch (emailError) {
      console.error("Forgot Email failed:", emailError.message);
    }

    res.status(200).json({ message: responseMessage });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

//! VERIFY RESET OTP
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
      message: "OTP verified",
      email: user.email
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

//! RESET PASSWORD
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({
      email,
      resetOtp: otp,
      resetOtpExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired OTP"
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    await user.save();

    res.status(200).json({
      message: "Password reset successful"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

//! SONG CONTROLLERS
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
    res.status(500).json({ message: "Server Error" });
  }
};

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
    res.status(500).json({ message: "Server Error" });
  }
};

const getSongsByLanguage = async (req, res) => {
  try {
    const { language } = req.params;

    const songs = await Song.find({
      language: { $regex: new RegExp(`^${language}$`, "i") }
    });

    if (!songs.length) {
      return res.status(404).json({ message: "No songs found" });
    }

    res.json(songs);

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const getSongsByArtist = async (req, res) => {
  try {
    const artistName = req.params.artistName;

    const songs = await Song.find({
      artist: { $regex: new RegExp(`^${artistName}$`, "i") }
    });

    if (!songs.length) {
      return res.status(404).json({ message: "No songs found" });
    }

    res.json(songs);

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  registerUser,
  verifyOtp,
  loginUser,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  getAllSongs,
  getRecommendedSongs,
  getSongsByArtist,
  getSongsByLanguage
};