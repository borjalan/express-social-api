"use strict";

// const md_auth = require("../middlewares/authenticated");

const global_routes = require("./global");
const user_routes = require("./user");

const express = require("express");
const routes = express.Router();

//Controller
routes.use("/", global_routes);
routes.use("/", user_routes);

module.exports = routes;
