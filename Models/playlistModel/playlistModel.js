const mongoose = require("mongoose");
const { PlaylistSchema } = require("../../Schemas/Schema");

const Playlist = mongoose.model("Playlist", PlaylistSchema);
module.exports = Playlist;