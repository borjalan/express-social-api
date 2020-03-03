"use strict";

const mongoose = require("mongoose");
var MessageSchema = mongoose.Schema({
  emmiter: { type: Schema.ObjectId, ref: "User" },
  target: { type: Schema.ObjectId, ref: "User" },
  text: String,
  created_at: String
});

module.exports = mongoose.model("Message", MessageSchema);
