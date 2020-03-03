"use strict";

const ver = "V1.0.0";

function version(req, res) {
  res.status(200).send({ message: "API DEBATE " + ver });
}

module.exports = { version };
