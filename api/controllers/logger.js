"use strict";

const moment = require("moment");

function print_call(loc, body) {
  console.log("\x1b[33m", "[" + loc + "](" + moment().format("MMMM Do YYYY, h:mm:ss a") + "): " + JSON.stringify(body) + "\n");
}

function print_call_result(loc, result) {
  console.log("\x1b[32m", "[" + loc + "](" + moment().format("MMMM Do YYYY, h:mm:ss a") + "): " + JSON.stringify(result) + "\n");
}

function print_call_error(loc, error) {
  console.log("\x1b[31m", "[" + loc + "](" + moment().format("MMMM Do YYYY, h:mm:ss a") + "): " + JSON.stringify(error) + "\n");
}

module.exports = { print_call, print_call_result, print_call_error };
