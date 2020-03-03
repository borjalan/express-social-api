"use strict";

const Joi = require("joi");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("../services/jwt");
const logger = require("./logger");

const createUserSchema = Joi.object().keys({
  email: Joi.string()
    .email()
    .required(),
  name: Joi.string()
    .regex(/^[a-zA-Z]{3,30}$/)
    .required(),
  surname: Joi.string()
    .regex(/^[a-zA-Z]{3,30}$/)
    .optional(),
  nick: Joi.string()
    .regex(/^[a-zA-Z0-9]{3,30}$/)
    .optional(),
  password: Joi.string().required(),
  role: Joi.string()
    .valid("user")
    .required(),
  image: Joi.string().optional()
});
const loginUserSchema = Joi.object().keys({
  email: Joi.string()
    .email()
    .optional(),
  nick: Joi.string()
    .regex(/^[a-zA-Z0-9]{3,30}$/)
    .optional(),
  password: Joi.string().required(),
  gettoken: Joi.bool().optional()
});

function createUser(req, res) {
  logger.print_call("registro", req.body);

  // Comprobamos que los parámetros que nos pasan son correctos y los guardamos en local
  const { error } = Joi.validate(req.body, createUserSchema);
  if (error) {
    logger.print_call_error("Registro", { message: error.details.map(x => x.message).join(", ") });
    return res.status(422).send({ message: error.details.map(x => x.message).join(", ") });
  }
  const { name, surname, nick, role, image, email } = req.body;

  // Comprobamos que no existan usuarios con el nickname y email que nos pasan y creamos el user
  User.findOne({ $or: [{ email: email.toLowerCase() }, { nick: nick }] }).exec((err, users) => {
    if (err) {
      logger.print_call_error("Registro", { message: "Error en bd" });
      return res.status(500).send({ message: "Error en la petición" });
    }
    if (users) {
      logger.print_call_error("Registro", { message: "User o nickname en uso", user: { email: req.body.email, nick: req.body.nick } });
      return res.status(422).send({ message: "User o nickname en uso" });
    }
    // Creamos y guardamos en la base de datos el user
    const password = bcrypt.hashSync(req.body.password, 10);
    const user = new User({ name, verified: false, surname, nick, role, image, email, password });
    user.save((err, userStored) => {
      if (err) {
        logger.print_call_error("Registro", { message: "Error en bd" });
        return res.status(500).send({ message: "Error en la petición" });
      }

      if (userStored) {
        logger.print_call_result("registro", { user: userStored });
        return res.status(200).send({ user: userStored });
      } else {
        logger.print_call_error("Registro", { message: "No se ha registrado el usuario" });
        return res.status(404).send({ message: "No se ha registrado el usuario" });
      }
    });
  });
}

function loginUser(req, res) {
  logger.print_call("login", req.body);

  const { error } = Joi.validate(req.body, loginUserSchema);
  if (error) {
    logger.print_call_error("Registro", { message: error.details.map(x => x.message).join(", ") });
    return res.status(422).send({ message: error.details.map(x => x.message).join(", ") });
  }
  const { email, nick, password, gettoken } = req.body;

  User.findOne({ $or: [{ email: email }, { nick: nick }] }, (err, user) => {
    if (err) {
      logger.print_call_error("Login", { message: "Error en bd" });
      return res.status(500).send({ message: "Error en la petición" });
    }
    if (user) {
      bcrypt.compare(password, user.password, (err, check) => {
        if (err) {
          logger.print_call_error("Login", { message: "Error en bd" });
          return res.status(500).send({ message: "Error en la petición" });
        }
        if (check) {
          if (gettoken) {
            const token = jwt.genToken(user);
            logger.print_call_result("login", { token: token });
            return res.status(200).send({ token: token });
          } else {
            user.password = undefined;
            logger.print_call_result("login", { user: user });
            return res.status(200).send({ message: "Login con éxito", user: user });
          }
        } else {
          logger.print_call_error("Login", { message: "Password erróneo", credentials: { nick, email, password } });
          return res.status(404).send({ message: "Usuario no identificado" });
        }
      });
    } else {
      logger.print_call_error("Login", { message: "No existe el user", credentials: { nick, email, password } });
      return res.status(404).send({ message: "Usuario no identificado" });
    }
  });
}

function getUser(req, res) {
  logger.print_call("getUser", req.body);
  const userId = req.params.id;

  User.findById(userId, (err, user) => {
    if (err) {
      logger.print_call_error("getUser", { message: "Error en bd" });
      return res.status(500).send({ message: "Error en la petición" });
    }

    if (!user) {
      logger.print_call_error("getUser", { message: "El usuario no existe" });
      return res.status(404).send({ message: "EL usuario no existe" });
    }

    logger.print_call_result("getUser", { user: req.user });
    return res.status(200).send({ user });
  });
}

module.exports = {
  createUser,
  loginUser,
  getUser
};
