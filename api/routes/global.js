"use strict";

const express = require("express");
const GlobalController = require("../controllers/global");
const api = express.Router();

api.get("/ver", GlobalController.version);

module.exports = api;
