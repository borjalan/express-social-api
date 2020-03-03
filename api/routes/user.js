"use strict";

const md_auth = require("../middlewares/authenticated");

const express = require("express");
const UserController = require("../controllers/user");
const api = express.Router();

api.post("/registro", UserController.createUser);
api.get("/login", UserController.loginUser);
api.get("/user/:id", md_auth.ensureAuth, UserController.getUser);

module.exports = api;
