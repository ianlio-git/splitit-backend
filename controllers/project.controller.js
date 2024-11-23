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

// Función para agregar miembros a un proyecto
exports.addMembersToProject = async (req, res) => {
  const { projectId, memberIds } = req.body; // Extraemos el ID del proyecto y los IDs de los miembros a agregar

  try {
    // Verificamos si el proyecto existe
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Proyecto no encontrado" });
    }

    // Verificamos si el usuario que está intentando agregar miembros es el propietario del proyecto
    const owner = await User.findById(req.user.userId);
    if (!owner || owner._id.toString() !== project.owner.toString()) {
      return res
        .status(403)
        .json({
          message: "No tienes permiso para agregar miembros a este proyecto",
        });
    }

    // Verificamos si los IDs de miembros pertenecen a los amigos del usuario
    const invalidMemberIds = [];
    for (const memberId of memberIds) {
      // Comprobamos si el miembro está en la lista de amigos del propietario
      const isFriend = owner.friends.includes(memberId);
      if (!isFriend) {
        invalidMemberIds.push(memberId);
      }
    }

    // Si hay IDs inválidos, devolvemos un error
    if (invalidMemberIds.length > 0) {
      return res
        .status(400)
        .json({
          message: `Los siguientes usuarios no son amigos: ${invalidMemberIds.join(
            ", "
          )}`,
        });
    }

    // Agregamos los miembros al proyecto
    project.members.push(...memberIds);
    await project.save();

    // Respondemos con el proyecto actualizado
    res.status(200).json({
      message: "Miembros agregados correctamente",
      project: {
        id: project._id,
        name: project.name,
        description: project.description,
        members: project.members,
      },
    });
  } catch (err) {
    console.error("Error al agregar miembros:", err);
    res.status(500).json({ message: "Error al agregar miembros al proyecto" });
  }
};
