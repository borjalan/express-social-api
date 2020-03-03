"use strict";

const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

var UserSchema = mongoose.Schema({
  email: String,
  verified: Boolean,
  name: String,
  surname: String,
  nick: String,
  password: String,
  role: String,
  image: String
});
UserSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("User", UserSchema);
