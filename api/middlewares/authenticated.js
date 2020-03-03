"use strict";

const jwt = require("jwt-simple");
const moment = require("moment");
const env = require("../env_vars");
const logger = require("../controllers/logger");

exports.ensureAuth = function(req, res, next) {
  if (!req.headers.authorization) {
    logger.print_call_error("mdAuth", { message: "Sin Token en headers" });
    return res.status(403).send({ message: "No autorizado" });
  }

  const token = req.headers.authorization.replace(/["']+/g, "");

  try {
    const payload = jwt.decode(token, env.secretSauce);
    if (payload.exp <= moment().unix()) {
      logger.print_call_error("mdAuth", { message: "Token expirado" });
      return res.status(401).send({ message: "El token ha expirado" });
    }

    req.user = payload;
  } catch (error) {
    logger.print_call_error("mdAuth", { message: "Token no valido" });
    return res.status(404).send({ message: "El token no es válido" });
  }

  next();
};
