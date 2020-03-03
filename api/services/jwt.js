"use strict";

const jwt = require("jwt-simple");
const moment = require("moment");
const env = require("../env_vars");

function genToken(user) {
  const payload = {
    sub: user._id,
    name: user.name,
    surname: user.surname,
    nick: user.nick,
    email: user.email,
    role: user.role,
    image: user.image,
    iat: moment().unix(),
    exp: moment()
      .add(1, "days")
      .unix()
  };
  return jwt.encode(payload, env.secretSauce);
}

module.exports = { genToken };
