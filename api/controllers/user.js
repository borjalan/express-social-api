"use strict";

const Joi = require("joi");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

const User = require("../models/user");
const jwt = require("../services/jwt");
const logger = require("./logger");

const createUserSchema = Joi.object().keys({
  email: Joi.string()
    .email()
    .required(),
  description: Joi.string()
    .regex(/^[a-zA-Z0-9]{0,500}$/)
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

function getUsers(req, res) {
  logger.print_call("getUsers", req.body);
  const actualUserId = req.user.userId;
  const page = req.params.page || 1;
  const itemsPerPage = 5;

  User.paginate({}, { page: page, limit: itemsPerPage }, (err, users, total) => {
    if (err) {
      logger.print_call_result("getUsers", { message: "Error en bd" });
      return res.status(500).send({ message: "Error en la petición" });
    }

    if (!users) {
      logger.print_call_error("getUsers", { message: "Sin usuarios" });
      return res.status(200).send({ message: "No hay usuarios disponibles" });
    }

    logger.print_call_result("getUsers", users);
    return res.status(200).send({
      users,
      total
    });
  });
}

function editUser(req, res) {
  logger.print_call("editUser", req.body);

  const userId = req.params.id;
  let update = req.body;
  delete update.password;

  if (userId != req.user.sub) {
    return res.status(500).send({ message: "No tienes permiso para actualizar los datos del usuario" });
  }

  User.find({ $or: [{ email: update.email.toLowerCase() }, { nick: update.nick }] }).exec((err, users) => {
    if (err) {
      logger.print_call_error("editUser", { message: "Error en la bd" });
      return res.status(500).send({ message: "Error en la petición" });
    }
    let user_isset = false;
    users.forEach(user => {
      if (user && user._id != userId) user_isset = true;
    });

    if (user_isset) return res.status(404).send({ message: "Los datos ya están en uso" });

    User.findByIdAndUpdate(userId, update, { new: true }, (err, userUpdated) => {
      if (err) {
        logger.print_call_error("editUser", { message: "Error en la bd" });
        return res.status(500).send({ message: "Error en la petición" });
      }

      if (!userUpdated) {
        logger.print_call_error("editUser", { message: "No se ha podido actualizar el usuario" });
        return res.status(404).send({ message: "No se ha podido actualizar el usuario" });
      }

      logger.print_call_result("editUser", { message: "Exito", user: userUpdated });
      return res.status(200).send({ user: userUpdated });
    });
  });
}

function setAvatar(req, res) {
  logger.print_call("setAvatar", req.body);
  const userId = req.params.id;
  const userAvatar = req.user.image;
  console.log(req.user);

  if (userId != req.user.sub) {
    logger.print_call_error("setAvatar", { message: "No tienes permiso" });
    return res.status(500).send({ message: "No tienes permiso" });
  }

  if (req.file) {
    const file_path = req.file.path;
    const file_split = file_path.split("/");
    const file_name = file_split[2];
    const ext_split = req.file.originalname.split(".");
    const file_ext = ext_split[1];
    if (file_ext == "png" || file_ext == "jpg" || file_ext == jpeg || file_ext == gif) {
      User.findByIdAndUpdate(userId, { image: file_name }, (err, userUpdated) => {
        if (err) {
          logger.print_call_error("setAvatar", { message: "Error en la bd" });
          return res.status(500).send({ message: "Error en la petición" });
        }

        if (!userUpdated) {
          logger.print_call_error("setAvatar", { message: "No se ha podido actualizar el usuario" });
          return res.status(404).send({ message: "No se ha podido actualizar el usuario" });
        }

        fs.unlink("./uploads/users/" + userUpdated.image, () => {});
      });
      logger.print_call_result("setAvatar", { message: "Éxito", avatar: req.file });
      return res.status(200).send({ message: "Éxito" });
    } else {
      fs.unlink(file_path, err => {
        logger.print_call_error("setAvatar", { message: "Extensión no válida" });
        return res.status(200).send({ message: "Extensión no válida" });
      });
    }
  } else {
    logger.print_call_error("setAvatar", { message: "No se enviaron imágenes" });
    return res.status(200).send({ message: "No se enviaron imágenes" });
  }
}

module.exports = {
  createUser,
  loginUser,
  getUser,
  getUsers,
  editUser,
  setAvatar
};
