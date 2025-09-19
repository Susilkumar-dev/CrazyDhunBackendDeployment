

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


// --- FUNCTION: Handles FILE UPLOAD from the admin ---
const createSong = async (req, res) => {
    const {  title, artist, album, language, genre, tags} = req.body;
    
    try {
        // Check if all files are present
        if (!req.files || !req.files.songFile || !req.files.coverArt || !req.files.artistPic) {
            return res.status(400).json({ message: 'Song, cover art, and artist picture files are all required' });
        }
        
        // Upload all three files to Cloudinary using buffers
        const songResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { 
                    resource_type: "video",
                    folder: "songs" 
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(req.files.songFile[0].buffer);
        });
        
        const coverArtResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { 
                    folder: "cover_art" 
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(req.files.coverArt[0].buffer);
        });
        
        const artistPicResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { 
                    folder: "artist_pics" 
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(req.files.artistPic[0].buffer);
        });

        // Create new song document
        const song = new Song({
            title,
            artist,
            album,
            language,       
            genre,         
            tags,           
            filePath: songResult.secure_url,
            coverArtPath: coverArtResult.secure_url,
            artistPic: artistPicResult.secure_url,
        });
        
        // Save to database
        const createdSong = await song.save();
        
        // Return success response
        res.status(201).json(createdSong);
    } catch (error) {
        console.error("File upload error:", error);
        res.status(500).json({ 
            message: "Server Error during file upload: " + error.message 
        });
    }
};


// --- FUNCTION 2: Handles URL PASTING from the admin ---
const createSongWithUrl = async (req, res) => {
    const { title, artist, album, filePath, coverArtPath, artistPic, language, genre, tags, releaseDate } = req.body;
    try {
        if (!title || !filePath || !coverArtPath || !artistPic) {
            return res.status(400).json({ message: 'All URLs are required' });
        }
        
        const song = new Song({
            title,
            artist,
            album,
            language,
            genre,
            tags,
            releaseDate: releaseDate || null,
            status: true,
            filePath,
            coverArtPath,
            artistPic
        });
        
        const createdSong = await song.save();
        res.status(201).json(createdSong);
    } catch (error) {
        console.error("Error creating song with URL:", error);
        res.status(500).json({ message: "Server Error: " + error.message });
    }
};

// --- THIS IS THE APPROVAL FUNCTION ---
const approveSong = async (req, res) => {
    try {
        const pendingSong = await PendingSong.findById(req.params.id);
        if (!pendingSong) {
            return res.status(404).json({ message: 'Pending song not found' });
        }

        const newSong = new Song({
            title: pendingSong.title,
            artist: pendingSong.artist,
            album: pendingSong.album,
            filePath: pendingSong.filePath,
            coverArtPath: pendingSong.coverArtPath,
            artistPic: pendingSong.artistPic,
            language: pendingSong.language,   
            genre: pendingSong.genre,         
            tags: pendingSong.tags            
        });

        await newSong.save();
        await pendingSong.deleteOne();
        res.json({ message: 'Song approved and added to the library.' });
    } catch (error) {
        console.error("Error approving song:", error);
        res.status(500).json({ message: 'Server Error during approval' });
    }
};

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
  const { title, artist, album, language, genre, tags, releaseDate, status } = req.body;
  
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: 'Song not found' });
    
    // Handle file uploads if provided
    if (req.files) {
      if (req.files.songFile) {
        const songResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { 
              resource_type: "video",
              folder: "songs" 
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(req.files.songFile[0].buffer);
        });
        song.filePath = songResult.secure_url;
      }
      
      if (req.files.coverArt) {
        const coverArtResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { 
              folder: "cover_art" 
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(req.files.coverArt[0].buffer);
        });
        song.coverArtPath = coverArtResult.secure_url;
      }
      
      if (req.files.artistPic) {
        const artistPicResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { 
              folder: "artist_pics" 
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(req.files.artistPic[0].buffer);
        });
        song.artistPic = artistPicResult.secure_url;
      }
    }
    
    // Update fields
    song.title = title || song.title;
    song.artist = artist || song.artist;
    song.album = album || song.album;
    song.language = language || song.language;
    song.genre = genre || song.genre;
    song.tags = tags ? tags.split(',').map(tag => tag.trim()) : song.tags;
    song.releaseDate = releaseDate || song.releaseDate;
    song.status = status !== undefined ? status : song.status;
    
    const updatedSong = await song.save();
    res.json(updatedSong);
  } catch (error) {
    console.error("Error updating song:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
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

const getAllSongs = async (req, res) => {
  try {
    const songs = await Song.find({});
    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: 'Server Error getting songs' });
  }
};

const toggleSongStatus = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: 'Song not found' });
    
    song.status = !song.status;
    await song.save();
    
    res.json(song);
  } catch (error) {
    res.status(500).json({ message: "Server Error toggling song status" });
  }
};

module.exports = {
    registerAdmin,
    loginAdmin,
    createSong,
    getPendingSongs,
    approveSong,
    rejectSong,
    updateSong,
    deleteSong,
    getAllUsers,
    deleteUser,
    changeUserRole,
    createSongWithUrl, 
    getAllSongs,
     toggleSongStatus
};