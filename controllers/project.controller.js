const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model"); // Importa el modelo de usuario
const Project = require("../models/project.model"); // Importa el modelo de proyecto
const mongoose = require("mongoose"); // Asegúrate de importar mongoose
const { ObjectId } = require("mongodb"); // Importa ObjectId de mongodb

// Función de prueba
exports.testMessage = (req, res) => {
  res
    .status(200)
    .json({ message: "Esta es una ruta de prueba para los proyectos." });
};

// Función para crear un nuevo proyecto (grupo)
exports.createProject = async (req, res) => {
  const { name, description } = req.body; // Extraemos los datos del cuerpo de la solicitud (nombre y descripción)

  try {
    // Verificamos si el usuario que está creando el proyecto existe
    const owner = await User.findById(req.user.userId); // Aquí se asume que req.user.userId fue establecido en el middleware de autenticación
    if (!owner) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificamos si el proyecto ya existe
    const existingProject = await Project.findOne({ name });
    if (existingProject) {
      return res
        .status(400)
        .json({ message: "El nombre del proyecto ya está en uso" });
    }

    // Creamos un nuevo proyecto con solo el nombre, descripción y propietario
    const newProject = new Project({
      name,
      description,
      owner: req.user.userId, // El propietario es el usuario autenticado
    });

    // Guardamos el proyecto en la base de datos
    await newProject.save();

    // Agregamos el proyecto al array de proyectos del usuario
    owner.projects.push(newProject._id);
    await owner.save();

    // Respondemos con el proyecto creado
    res.status(201).json({
      message: "Proyecto creado correctamente",
      project: {
        id: newProject._id,
        name: newProject.name,
        description: newProject.description,
        owner: newProject.owner,
      },
    });
  } catch (err) {
    console.error("Error al crear el proyecto:", err);
    res.status(500).json({ message: "Error al crear el proyecto" });
  }
};

exports.addMemberToProject = async (req, res) => {
  const { projectId, memberId } = req.body; // Recibimos el ID del proyecto y el ID del miembro a agregar

  try {
    // Verificamos si el usuario que está creando el proyecto (el propietario) existe
    const owner = await User.findById(req.user.userId); // req.user.userId es el ID del usuario autenticado
    if (!owner) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Buscamos el proyecto por su ID
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Proyecto no encontrado" });
    }

    // Verificamos si el usuario autenticado es el propietario del proyecto
    if (project.owner.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "No tienes permisos para modificar este proyecto" });
    }

    // Verificamos si el miembro está en la lista de amigos del propietario
    if (!owner.friends.includes(memberId)) {
      return res.status(400).json({
        message: `El usuario con ID ${memberId} no está en tu lista de amigos`,
      });
    }

    // Agregamos el miembro al proyecto
    if (!project.members.includes(memberId)) {
      project.members.push(memberId); // Solo lo agregamos si no está ya en la lista de miembros
      await project.save();
    } else {
      return res.status(400).json({
        message: `El miembro con ID ${memberId} ya está en el proyecto.`,
      });
    }

    // Agregamos el proyecto al array de proyectos del miembro
    const member = await User.findById(memberId);
    if (member) {
      member.projects.push(project._id); // Agregamos el proyecto al array de proyectos del miembro
      await member.save();
    }

    // Respondemos con el proyecto actualizado
    res.status(200).json({
      message: "Miembro agregado correctamente al proyecto",
      project: {
        id: project._id,
        name: project.name,
        description: project.description,
        owner: project.owner,
        members: project.members,
      },
    });
  } catch (err) {
    console.error("Error al agregar miembro al proyecto:", err);
    res.status(500).json({ message: "Error al agregar miembro al proyecto" });
  }
};

// Función para obtener los detalles de un proyecto
exports.postProjectDetails = async (req, res) => {
  // Extraemos el token de los encabezados de la solicitud
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    // Verificamos y decodificamos el token para obtener el ID del usuario
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId; // Asegúrate de que el token contenga el campo `userId`

    // Extraemos el projectId del cuerpo de la solicitud
    const { projectId } = req.body;

    console.log("Token recibido:", token);
    console.log("ProjectId recibido en el body:", projectId);
    console.log("userId extraído del token:", userId);

    if (!projectId) {
      return res.status(400).json({ msg: "Project ID is required" });
    }

    // Buscar el usuario en la base de datos utilizando el userId extraído del token
    const user = await User.findById(userId).populate({
      path: "projects", // Popula los proyectos del usuario
      populate: [
        { path: "owner", select: "name email" },
        { path: "members", select: "name email" },
      ],
    });

    // Verificamos si el usuario existe
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificamos si el proyecto existe en los proyectos del usuario
    const project = user.projects.find(
      (proj) => proj._id.toString() === projectId
    );

    if (!project) {
      return res
        .status(404)
        .json({ message: "Proyecto no encontrado o no autorizado" });
    }

    // Si encontramos el proyecto, devolvemos los detalles
    res.status(200).json({
      message: "Detalles del proyecto obtenidos correctamente",
      project: {
        id: project._id,
        name: project.name,
        description: project.description,
        owner: project.owner, // Detalles del propietario
        members: project.members, // Detalles de los miembros
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
    });
  } catch (err) {
    console.error("Error al verificar el token o al obtener el proyecto:", err);
    res.status(500).json({ message: "Error al obtener el proyecto" });
  }
};

// Función para obtener todos los proyectos de un usuario
exports.getAllProjects = async (req, res) => {
  // Extraemos el token de los encabezados de la solicitud
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    // Verificamos y decodificamos el token para obtener el ID del usuario
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId; // Asegúrate de que el token contenga el campo `userId`

    console.log("userId extraído del token:", userId);

    // Buscar el usuario en la base de datos utilizando el userId extraído del token
    const user = await User.findById(userId).populate({
      path: "projects", // Popula los proyectos del usuario
      select: "name description", // Seleccionamos solo el nombre y la descripción de cada proyecto
    });

    // Verificamos si el usuario existe
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Si no tiene proyectos
    if (!user.projects || user.projects.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron proyectos para este usuario" });
    }

    // Devolvemos el listado de proyectos con su nombre, detalle y id
    res.status(200).json({
      message: "Proyectos del usuario obtenidos correctamente",
      projects: user.projects.map((project) => ({
        id: project._id,
        name: project.name,
        description: project.description,
      })),
    });
  } catch (err) {
    console.error(
      "Error al verificar el token o al obtener los proyectos:",
      err
    );
    res.status(500).json({ message: "Error al obtener los proyectos" });
  }
};

// Función para eliminar un miembro de un proyecto
exports.removeMemberFromProject = async (req, res) => {
  const { projectId, memberId } = req.body; // El ID del proyecto y el ID del miembro a eliminar

  // Verificar si el proyecto y el miembro están presentes
  if (!projectId || !memberId) {
    return res
      .status(400)
      .json({ message: "Se debe proporcionar el projectId y el memberId" });
  }

  try {
    // Buscar el proyecto por ID
    const project = await Project.findById(projectId);

    // Verificar si el proyecto existe
    if (!project) {
      return res.status(404).json({ message: "Proyecto no encontrado" });
    }

    // Verificar si el miembro está en el proyecto
    if (!project.members.includes(memberId)) {
      return res
        .status(400)
        .json({ message: "El miembro no está en el proyecto" });
    }

    // Eliminar el miembro del array de miembros
    project.members = project.members.filter(
      (member) => member.toString() !== memberId
    );

    // Guardar los cambios en el proyecto
    await project.save();

    // Opcional: Eliminar también el proyecto del listado de proyectos del usuario
    await User.updateOne({ _id: memberId }, { $pull: { projects: projectId } });

    // Responder exitosamente
    res
      .status(200)
      .json({ message: "Miembro eliminado del proyecto correctamente" });
  } catch (err) {
    console.error("Error al eliminar miembro del proyecto:", err);
    res
      .status(500)
      .json({ message: "Error al eliminar el miembro del proyecto" });
  }
};
