"use strict";
const mongoose = require("mongoose");
const app = require("./app");
const port = 3800;

// Conexión base de datos
mongoose.Promise = global.Promise;
mongoose
  .connect("mongodb+srv://api_root:Bn2oxKhf8zSRTs47@testingmongo-z9fe2.mongodb.net/test?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "Social"
  })
  .then(() => {
    console.log("\x1b[36m%s\x1b[0m", "\nConexión a la base de datos realizada con éxito");

    // Crear servidor
    app.listen(port, () => {
      console.log("\x1b[36m%s\x1b[0m", "Servidor en marcha en http://localhost:" + port + "\n");
    });
  })
  .catch(err => {
    console.log("\x1b[31m", "[ERROR]  " + err + "\n");
  });
