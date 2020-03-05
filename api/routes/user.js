"use strict";

const express = require("express");
const multer = require("multer");

const md_upload = multer({ dest: "./uploads/users" });
const md_auth = require("../middlewares/authenticated");

const UserController = require("../controllers/user");
const api = express.Router();

api.post("/register", UserController.createUser);
api.get("/login", UserController.loginUser);
api.get("/user/:id", md_auth.ensureAuth, UserController.getUser);
api.get("/friends/:page?", md_auth.ensureAuth, UserController.getUsers);
api.get("/edit-user/:id", md_auth.ensureAuth, UserController.editUser);
api.post("/upload-image-user/:id", [md_auth.ensureAuth, md_upload.single("avatar")], UserController.setAvatar);

module.exports = api;
