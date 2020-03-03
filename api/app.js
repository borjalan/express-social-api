"use strict";

const express = require("express");
const bodyParser = require("body-parser");

var app = express();

// Cargar Endpoints
var routes = require("./routes/index");

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cors

// Endpoints
app.use("/", routes);

// Export
module.exports = app;
