require("dotenv").config(); // Asegúrate de que las variables de entorno estén cargadas

//express
const express = require("express");
const cookieParser = require("cookie-parser");

//cors
const cors = require("cors");

//import routes
const userRoutes = require("./routes/user.routes"); // Importamos las rutas de usuarios
const projectRoutes = require("./routes/project.routes"); // Importamos las rutas de proyectos
const ticketRoutes = require("./routes/ticket.routes"); // Importamos las rutas de tickets

//instance server
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//use cors
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
  })
);
app.use(cookieParser());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

// Configuración de rutas
app.use("/api/users", userRoutes); // Las rutas de usuario estarán bajo /api/users
app.use("/api/projects", projectRoutes);
app.use("/api/tickets", ticketRoutes);

// Database connection
const mongoose = require("mongoose");
const mongoUrl = process.env.MONGO_URL;

if (!mongoUrl) {
  console.error("MONGO_URL no está definida en el archivo .env");
  process.exit(1); // Detiene la aplicación si la URL de MongoDB no está definida
}

console.log("BD:", mongoUrl);

// Opciones para la conexión a MongoDB
let opts = {
  connectTimeoutMS: 20000,
};

mongoose
  .connect(mongoUrl, opts)
  .then(() => {
    console.log("Conectado a MongoDB");
  })
  .catch((err) => {
    console.log("Error al conectar a MongoDB", err);
  });

// setup server
const port = process.env.PORT || 8080;

// listen
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
