// scripts/migrate-songs.js
const mongoose = require('mongoose');
require('dotenv').config();

// Adjust the path according to your project structure
const connectDB = require('../config/database/db');
// Adjust the path according to your project structure
const Song = require('../Models/songModel/songModel');

const migrateSongs = async () => {
    try {
        await connectDB();
        
        // Get all songs without language
        const songs = await Song.find({ language: { $exists: false } });
        
        console.log(`Found ${songs.length} songs without language data`);
        
        // Update each song with a default language
        for (const song of songs) {
            // You can set a default language or extract from album name
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