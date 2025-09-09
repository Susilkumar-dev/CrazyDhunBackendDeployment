const mongoose = require("mongoose");
const { PendingSongSchema } = require("../../Schemas/Schema");

const PendingSong = mongoose.model("PendingSong", PendingSongSchema);
module.exports = PendingSong;