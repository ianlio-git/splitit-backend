const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticket.controller"); // Controlador de tikets
const auth = require("../middleware/auth"); // Middleware de autenticación

// Ruta para prueba de mensajes
router.get("/test", ticketController.testMessage);

// Ruta para crear un ticket
router.post("/create", auth, ticketController.createTicket);

// Ruta para eliminar un ticket
router.delete("/delete", auth, ticketController.deleteTicket);

// Ruta para obtener todos los tickets de un proyecto
router.post("/get-tikets", auth, ticketController.getTickets);

router.post("/image", auth, ticketController.getTickets);

// Aquí puedes agregar otras rutas de proyectos, como obtener proyectos, actualizar, eliminar, etc.
module.exports = router;
