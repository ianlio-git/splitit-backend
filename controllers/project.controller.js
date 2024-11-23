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
