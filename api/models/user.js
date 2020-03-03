"use strict";

const mongoose = require("mongoose");

var UserSchema = mongoose.Schema({
  email: String,
  verified : Boolean,
  name: String,
  surname: String,
  nick: String,
  password: String,
  role: String,
  image: String
});

module.exports = mongoose.model("User", UserSchema);
