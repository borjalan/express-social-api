"use strict";

const mongoose = require("mongoose");
var PublicationSchema = mongoose.Schema({
  user: { type: Schema.ObjectId, ref: "User" },
  text: String,
  file: String,
  created_at: String
});

module.exports = mongoose.model("Publication", PublicationSchema);
