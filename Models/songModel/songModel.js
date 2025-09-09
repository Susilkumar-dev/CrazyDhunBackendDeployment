const mongoose = require("mongoose");
const { SongSchema } = require("../../Schemas/Schema");

const Song = mongoose.model("Song", SongSchema);
module.exports = Song;