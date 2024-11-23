const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model"); // Importa el modelo de usuario
const Project = require("../models/project.model"); // Importa el modelo de proyecto
const { ObjectId } = require("mongodb"); // Importa ObjectId de mongodb

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
/**
 * Obtener el perfil del usuario autenticado.
 * @param {Object} req - La solicitud HTTP.
 * @param {Object} req.header - Los encabezados de la solicitud.
 * @param {string} req.header.x-auth-token - El token de autenticación.
 * @param {Object} req.user - El usuario decodificado del token.
 * @param {string} req.user.userId - El ID del usuario.
 * @param {Object} res - La respuesta HTTP.
 */
exports.profile = async (req, res) => {
  try {
    console.log("Token recibido en la solicitud:", req.header("x-auth-token"));
    console.log("Token decodificado correctamente:", req.user); // Verifica que req.user no sea undefined

    const user = await User.findById(req.user.userId) // Accede a req.user.userId
      .select(
        "email password name lastname photo projects friends createdAt updatedAt"
      ) // Solo los campos necesarios
      .populate("projects", "_id") // Traer solo los IDs de los proyectos
      .populate("friends", "_id"); // Traer solo los IDs de los amigos

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const userProfile = {
      _id: { $oid: user._id.toString() },
      email: user.email,
      password: user.password,
      name: user.name,
      lastname: user.lastname,
      photo: user.photo || "https://example.com/photo.jpg",
      projects: user.projects.map((project) => ({
        $oid: project._id.toString(),
      })),
      friends: user.friends.map((friend) => ({
        $oid: friend._id.toString(),
      })),
      createdAt: {
        $date: { $numberLong: user.createdAt.getTime().toString() },
      },
      updatedAt: {
        $date: { $numberLong: user.updatedAt.getTime().toString() },
      },
    };

    res.status(200).json(userProfile);
  } catch (err) {
    console.error("Error al obtener el perfil:", err);
    res.status(500).json({ message: "Error al obtener el perfil" });
  }
};

//---------------------------------------------

/**
 * Actualizar datos del usuario (requiere autenticación).
 * @param {Object} req - La solicitud HTTP.
 * @param {Object} req.body - El cuerpo de la solicitud.
 * @param {string} [req.body.name] - El nuevo nombre del usuario.
 * @param {string} [req.body.email] - El nuevo correo electrónico del usuario.
 * @param {string} [req.body.password] - La nueva contraseña del usuario.
 * @param {string} [req.body.photo] - La nueva foto del usuario.
 * @param {Object} req.user - El usuario autenticado decodificado del token.
 * @param {string} req.user.userId - El ID del usuario autenticado.
 * @param {Object} res - La respuesta HTTP.
 */
exports.update = async (req, res) => {
  const { name, email, password, photo } = req.body;

  // Validar que al menos uno de los campos está presente en la solicitud
  if (!name && !email && !password && !photo) {
    return res.status(400).json({
      message: "Debe proporcionar al menos un campo para actualizar.",
    });
  }

  try {
    // Log para ver si el token se está recibiendo correctamente
    console.log("Token decodificado:", req.user);

    // Convertir a ObjectId
    const userId = new ObjectId(req.user.userId); // Corregido

    // Buscar el usuario en la base de datos
    const user = await User.findById(userId); // Usar ObjectId en la búsqueda
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Log para ver si el usuario fue encontrado
    console.log("Usuario encontrado:", user);

    // Si se va a actualizar la contraseña, la hasheamos primero
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    // Verificar si el email ya está en uso
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "El email ya está en uso por otro usuario" });
      }
      user.email = email;
    }

    // Actualizar otros campos
    if (name) user.name = name;
    if (photo) user.photo = photo;

    // Guardar el usuario actualizado
    const updatedUser = await user.save();

    // Log para ver el usuario actualizado
    console.log("Usuario actualizado:", updatedUser);

    // Responder con el usuario actualizado
    res.status(200).json({
      id: updatedUser._id,
      email: updatedUser.email,
      name: updatedUser.name,
      photo: updatedUser.photo,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    });
  } catch (err) {
    console.error("Error al actualizar el usuario:", err);
    res.status(500).json({ message: "Error al actualizar el usuario" });
  }
};

//---------------------------------------------
/**
 * Eliminar la cuenta del usuario autenticado (requiere autenticación).
 * @param {Object} req - La solicitud HTTP.
 * @param {Object} req.body - El cuerpo de la solicitud.
 * @param {string} req.body.password - La contraseña del usuario para verificar la identidad.
 * @param {Object} req.user - El usuario autenticado decodificado del token.
 * @param {string} req.user.userId - El ID del usuario autenticado.
 * @param {Object} res - La respuesta HTTP.
 */
exports.delete = async (req, res) => {
  const { password } = req.body;

  try {
    // Buscar el usuario por el userId
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar si la contraseña proporcionada coincide con la almacenada
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "La contraseña es incorrecta" });
    }

    // Eliminar el usuario usando findByIdAndDelete
    await User.findByIdAndDelete(req.user.userId);

    // Responder con un mensaje de éxito
    res.status(200).json({ message: "Cuenta eliminada correctamente" });
  } catch (err) {
    console.error("Error al eliminar el usuario:", err);
    res.status(500).json({ message: "Error al eliminar el usuario" });
  }
};

/**
 * Agregar un amigo al usuario autenticado (requiere autenticación).
 * @param {Object} req - La solicitud HTTP.
 * @param {Object} req.body - El cuerpo de la solicitud.
 * @param {string} req.body.email - El correo del amigo que se desea agregar.
 * @param {string} req.body.name - El nombre del amigo que se desea agregar.
 * @param {Object} req.user - El usuario autenticado decodificado del token.
 * @param {string} req.user.userId - El ID del usuario autenticado.
 * @param {Object} res - La respuesta HTTP.
 */
exports.addFriend = async (req, res) => {
  const { email, name } = req.body;

  try {
    // Buscar al usuario que se desea agregar como amigo
    const friend = await User.findOne({ email });
    if (!friend) {
      return res.status(404).json({ message: "Amigo no encontrado" });
    }

    // Buscar al usuario autenticado por el userId del token
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "Usuario autenticado no encontrado" });
    }

    // Verificar si el amigo ya está en la lista de amigos
    if (user.friends.includes(friend._id)) {
      return res.status(400).json({ message: "Ya eres amigo de este usuario" });
    }

    // Agregar al amigo a la lista de amigos del usuario autenticado
    user.friends.push(friend._id);

    // Guardar el usuario actualizado
    await user.save();

    // Responder con un mensaje de éxito
    res.status(200).json({
      message: `Amigo ${name} agregado exitosamente`,
      friend: {
        _id: friend._id,
        name: friend.name,
        email: friend.email,
      },
    });
  } catch (err) {
    console.error("Error al agregar el amigo:", err);
    res.status(500).json({ message: "Error al agregar el amigo" });
  }
};

/**
 * Eliminar un amigo del usuario autenticado (requiere autenticación).
 * @param {Object} req - La solicitud HTTP.
 * @param {Object} req.body - El cuerpo de la solicitud.
 * @param {string} req.body.email - El correo del amigo que se desea eliminar.
 * @param {Object} req.user - El usuario autenticado decodificado del token.
 * @param {string} req.user.userId - El ID del usuario autenticado.
 * @param {Object} res - La respuesta HTTP.
 */
exports.removeFriend = async (req, res) => {
  const { email } = req.body;

  try {
    // Buscar al usuario que se desea eliminar como amigo
    const friend = await User.findOne({ email });
    if (!friend) {
      return res.status(404).json({ message: "Amigo no encontrado" });
    }

    // Buscar al usuario autenticado por el userId del token
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "Usuario autenticado no encontrado" });
    }

    // Verificar si el amigo está en la lista de amigos
    const friendIndex = user.friends.indexOf(friend._id);
    if (friendIndex === -1) {
      return res
        .status(400)
        .json({ message: "El usuario no está en tu lista de amigos" });
    }

    // Eliminar al amigo de la lista de amigos
    user.friends.splice(friendIndex, 1);

    // Guardar el usuario actualizado
    await user.save();

    // Responder con un mensaje de éxito
    res.status(200).json({
      message: `Amigo ${friend.name} eliminado exitosamente`,
      friend: {
        _id: friend._id,
        name: friend.name,
        email: friend.email,
      },
    });
  } catch (err) {
    console.error("Error al eliminar el amigo:", err);
    res.status(500).json({ message: "Error al eliminar el amigo" });
  }
};

/**
 * Obtener todos los amigos del usuario autenticado.
 * @param {Object} req - La solicitud HTTP.
 * @param {Object} req.user - El usuario autenticado decodificado del token.
 * @param {string} req.user.userId - El ID del usuario autenticado.
 * @param {Object} res - La respuesta HTTP.
 */
exports.getFriends = async (req, res) => {
  try {
    // Buscar al usuario autenticado por su ID
    const user = await User.findById(req.user.userId)
      .populate("friends", "email name photo") // Poblar los detalles de los amigos
      .select("friends"); // Solo obtener la lista de amigos

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar si el usuario tiene amigos
    if (!user.friends || user.friends.length === 0) {
      return res.status(404).json({ message: "No tienes amigos en la lista" });
    }

    // Responder con la lista de amigos
    res.status(200).json({ friends: user.friends });
  } catch (err) {
    console.error("Error al obtener la lista de amigos:", err);
    res.status(500).json({ message: "Error al obtener la lista de amigos" });
  }
};
