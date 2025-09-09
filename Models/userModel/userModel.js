const mongoose = require("mongoose");
const { UserSchema } = require("../../Schemas/Schema");

const User = mongoose.model("User", UserSchema); 
module.exports = User;