const mongoose = require("mongoose");
const { adminSchema } = require("../../Schemas/Schema");

const Admin=mongoose.model("Admin",adminSchema)

module.exports= Admin