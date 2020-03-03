"use strict";

const mongoose = require("mongoose");
var FollowSchema = mongoose.Schema({
  user: { type: Schema.ObjectId, ref: "User" },
  followed: { type: Schema.ObjectId, ref: "User" }
});

module.exports = mongoose.model("Follow", FollowSchema);
