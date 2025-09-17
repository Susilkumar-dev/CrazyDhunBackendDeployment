
const mongoose = require('mongoose');
require('dotenv').config();


const connectDB = require('../config/database/db');
const Song = require('../Models/songModel/songModel');

const migrateSongs = async () => {
    try {
        await connectDB();
        
        // Get all songs without language
        const songs = await Song.find({ language: { $exists: false } });
        
        console.log(`Found ${songs.length} songs without language data`);
        
        // Update each song with a default language
        for (const song of songs) {
            song.language = "Unknown";
            await song.save();
            console.log(`Updated song: ${song.title}`);
        }
        
        console.log("Migration completed successfully");
        process.exit(0);
    } catch (error) {
        console.error("Migration error:", error);
        process.exit(1);
    }
};

migrateSongs();