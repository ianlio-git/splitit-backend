const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const auth = require("../middleware/auth"); // Verifica si estás usando un middleware de autenticación

// Ruta para registrar un nuevo usuario
router.post("/register", userController.register);

// Ruta para iniciar sesión
router.post("/login", userController.login);

// Ruta para obtener el perfil de usuario (requiere autenticación)
router.get("/profile", auth, userController.profile);

// Ruta para actualizar el usuario (requiere autenticación)
router.put("/update", auth, userController.update);

// Ruta para eliminar el usuario (requiere autenticación)
router.delete("/delete", auth, userController.delete);

// Ruta para agregar un amigo
router.post("/add-friend", auth, userController.addFriend);

// Ruta para eliminar un amigo
router.post("/remove-friend", auth, userController.removeFriend);

// Ruta para obtener amigos
router.get("/friends", auth, userController.getFriends);

// Ruta para enviar
router.post("/reset", userController.resetPassword);

// Ruta para cambiar la contraseña
router.post("/change-password", auth, userController.changePassword);

// **Nueva ruta de respuesta** que dirige a la función response del controlador
router.get("/response", userController.response); // Cambié aquí para usar userController.response

router.get("/users", userController.getAllUsers);

module.exports = router;
