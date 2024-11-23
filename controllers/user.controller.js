const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model"); // Asegúrate de tener el modelo de usuario

/**
 * Envía una respuesta de prueba en formato JSON.
 * @param {Object} req - La solicitud HTTP.
 * @param {Object} res - La respuesta HTTP.
 */
exports.response = (req, res) => {
  res.json({ message: "Esta es una respuesta en formato JSON" });
};
//---------------------------------------------
/**
 * Obtener todos los usuarios de la base de datos.
 * @param {Object} req - La solicitud HTTP.
 * @param {Object} res - La respuesta HTTP.
 */
exports.getAllUsers = async (req, res) => {
  try {
    // Obtener todos los usuarios de la base de datos
    const users = await User.find();

    // Verificar si no hay usuarios
    if (users.length === 0) {
      return res.status(404).json({ message: "No se encontraron usuarios" });
    }

    // Enviar los usuarios encontrados
    res.status(200).json(users);
  } catch (err) {
    console.error("Error al obtener los usuarios:", err);
    res.status(500).json({ message: "Error al obtener los usuarios" });
  }
};
//---------------------------------------------
/**
 * Registrar un nuevo usuario.
 * @param {Object} req - La solicitud HTTP.
 * @param {Object} req.body - El cuerpo de la solicitud.
 * @param {string} req.body.email - El correo electrónico del usuario.
 * @param {string} req.body.password - La contraseña del usuario.
 * @param {Object} res - La respuesta HTTP.
 */
exports.register = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    // Hashear la contraseña del usuario
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });

    // Guardar el nuevo usuario en la base de datos
    await newUser.save();
    res.status(201).json({ message: "Usuario registrado exitosamente" });
  } catch (err) {
    console.error("Error al registrar el usuario:", err); // Imprime el error detallado
    res.status(500).json({ message: "Error al registrar el usuario" });
  }
};
//---------------------------------------------
/**
 * Iniciar sesión de usuario.
 * @param {Object} req - La solicitud HTTP.
 * @param {Object} req.body - El cuerpo de la solicitud.
 * @param {string} req.body.email - El correo electrónico del usuario.
 * @param {string} req.body.password - La contraseña del usuario.
 * @param {Object} res - La respuesta HTTP.
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  console.log("Email recibido:", email);
  console.log("Password recibido:", password);

  try {
    // Verificación de que JWT_SECRET esté definido
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET no está definido en el archivo .env");
      return res.status(500).json({
        message: "Error en el servidor. JWT_SECRET no está configurado.",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    // Si JWT_SECRET está definido, creamos el token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Respuesta con el mensaje de éxito y el token
    res.status(200).json({
      message: "Ingresaste con éxito", // Mensaje de éxito
      token: token, // El token generado
    });
  } catch (err) {
    console.log(err); // Esto te dará más detalles sobre el error
    res.status(500).json({ message: "Error al iniciar sesión" });
  }
};
//---------------------------------------------
// Ver perfil de usuario (requiere autenticación)
exports.profile = async (req, res) => {
  try {
    const user = await User.findById(req.userId); // Asumiendo que auth middleware coloca el userId en la solicitud
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: "Error al obtener el perfil" });
  }
};
//---------------------------------------------
// Actualizar datos del usuario (requiere autenticación)
exports.update = async (req, res) => {
  const { name, email } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.userId, // Asumiendo que auth middleware coloca el userId en la solicitud
      { name, email },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "Error al actualizar el usuario" });
  }
};
//---------------------------------------------
// Eliminar usuario (requiere autenticación)
exports.delete = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.userId); // Asumiendo que auth middleware coloca el userId en la solicitud
    res.status(200).json({ message: "Usuario eliminado" });
  } catch (err) {
    res.status(500).json({ message: "Error al eliminar el usuario" });
  }
};
