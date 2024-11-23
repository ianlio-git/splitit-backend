const express = require("express");
const router = express.Router();
const projectController = require("../controllers/project.controller"); // Controlador de proyectos
const auth = require("../middleware/auth"); // Middleware de autenticación

// Ruta de prueba que llama a la función testMessage del controlador
router.get("/test", projectController.testMessage);

// Ruta para crear un nuevo proyecto (requiere autenticación)
router.post("/create", auth, projectController.createProject);

// Aquí puedes agregar otras rutas de proyectos, como obtener proyectos, actualizar, eliminar, etc.

module.exports = router;
