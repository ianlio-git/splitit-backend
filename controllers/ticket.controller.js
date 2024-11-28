const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model"); // Importa el modelo de usuario
const Project = require("../models/project.model"); // Importa el modelo de proyecto
const Ticket = require("../models/ticket.model"); // Importa el modelo de ticket
const mongoose = require("mongoose"); // Asegúrate de importar mongoose
const { ObjectId } = require("mongodb"); // Importa ObjectId de mongodb

// Función de prueba
exports.testMessage = (req, res) => {
  res
    .status(200)
    .json({ message: "Esta es una ruta de prueba para los tickets." });
};

/**
 * Controlador para crear un nuevo ticket y asociarlo a un proyecto.
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} res - Objeto de respuesta.
 */
exports.createTicket = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        msg: "No se pudo encontrar el token del usuario autenticado.",
      });
    }

    const { projectId, description, date, image, amount, distribution } =
      req.body;
    console.log(req.body);
    if (!projectId) {
      return res.status(400).json({
        msg: "El ID del proyecto es obligatorio.",
      });
    }

    // Buscar el proyecto
    const project = await Project.findById(projectId).populate("members");

    if (!project) {
      return res.status(404).json({
        msg: "El proyecto no existe.",
      });
    }

    const userIsAuthorized =
      project.owner.toString() === req.user.userId ||
      project.members.some(
        (member) => member._id.toString() === req.user.userId
      );

    if (!userIsAuthorized) {
      return res.status(403).json({
        msg: "El usuario no tiene permiso para este proyecto.",
      });
    }

    // Crear el ticket en la base de datos
    const newTicket = await Ticket.create({
      uploader: req.user.userId, // ID del usuario que crea el ticket
      projectId: projectId,
      description,
      date,
      image,
      amount,
      distribution,
    });

    // Agregar el _id del ticket al arreglo de tickets del proyecto
    project.tickets.push(newTicket._id);

    // Guardar los cambios en el proyecto
    await project.save();

    return res.status(201).json({
      msg: "Ticket creado exitosamente.",
      ticket: newTicket,
    });
  } catch (error) {
    console.error("Error al crear el ticket:", error.message);
    return res.status(500).json({
      msg: "Hubo un error al procesar la solicitud.",
    });
  }
};

exports.deleteTicket = async (req, res) => {
  try {
    // Verificar si req.user existe (el token del usuario autenticado)
    if (!req.user) {
      return res.status(401).json({
        msg: "No se pudo encontrar el token del usuario autenticado.",
      });
    }

    // Obtener el ticketId de la solicitud
    const { ticketId } = req.body;

    // Verificar si el ticketId está presente
    if (!ticketId) {
      return res.status(400).json({
        msg: "El ID del ticket es obligatorio.",
      });
    }

    // Buscar el ticket en la base de datos
    const ticket = await Ticket.findById(ticketId);

    // Verificar si el ticket existe
    if (!ticket) {
      return res.status(404).json({
        msg: "El ticket no existe.",
      });
    }

    // Buscar el proyecto al que pertenece el ticket
    const project = await Project.findById(ticket.projectId);

    // Verificar si el proyecto existe
    if (!project) {
      return res.status(404).json({
        msg: "El proyecto asociado al ticket no existe.",
      });
    }

    // Verificar si el usuario es el propietario del proyecto o el uploader del ticket
    const isOwner = project.owner.toString() === req.user.userId; // Verifica si el usuario es el propietario del proyecto
    const isUploader = ticket.uploader.toString() === req.user.userId; // Verifica si el usuario es el uploader del ticket

    if (!isOwner && !isUploader) {
      return res.status(403).json({
        msg: "No tienes permisos para eliminar este ticket.",
      });
    }

    // Eliminar el ticket de la base de datos
    await Ticket.deleteOne({ _id: ticketId }); // Utilizar deleteOne en lugar de remove

    // Eliminar el ticket de la lista de tickets del proyecto
    // Asegurarse de comparar el _id correctamente al convertir ambos valores a cadenas
    project.tickets = project.tickets.filter(
      (projectTicketId) => projectTicketId.toString() !== ticketId.toString()
    );

    // Guardar los cambios en el proyecto
    await project.save();

    // Responder con éxito
    res.status(200).json({
      msg: "Ticket eliminado exitosamente.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Error al eliminar el ticket.",
    });
  }
};

exports.getTickets = async (req, res) => {
  try {
    // Verificar si req.user existe (el token del usuario autenticado)
    if (!req.user) {
      return res.status(401).json({
        msg: "No se pudo encontrar el token del usuario autenticado.",
      });
    }

    // Obtener el projectId de la solicitud
    const { projectId } = req.body;

    // Verificar si el projectId está presente
    if (!projectId) {
      return res.status(400).json({
        msg: "El ID del proyecto es obligatorio.",
      });
    }

    // Buscar el proyecto en la base de datos
    const project = await Project.findById(projectId);

    // Verificar si el proyecto existe
    if (!project) {
      return res.status(404).json({
        msg: "El proyecto no existe.",
      });
    }

    // Buscar los tickets asociados al proyecto y poblar la propiedad uploader
    const tickets = await Ticket.find({ projectId: projectId })
      .populate("uploader", "name _id") // Poblamos 'name' y '_id' del uploader
      .exec();

    // Verificar si hay tickets asociados al proyecto
    if (!tickets || tickets.length === 0) {
      return res.status(404).json({
        msg: "No hay tickets asociados a este proyecto.",
      });
    }

    // Responder con los tickets y los nombres de los usuarios que los cargaron
    res.status(200).json({
      msg: "Tickets obtenidos correctamente.",
      tickets: tickets.map((ticket) => ({
        _id: ticket._id,
        description: ticket.description,
        date: ticket.date,
        image: ticket.image,
        amount: ticket.amount,
        distribution: ticket.distribution,
        uploaderId: ticket.uploader ? ticket.uploader._id : "Desconocido", // Agregamos el ID del uploader
        uploaderName: ticket.uploader ? ticket.uploader.name : "Desconocido", // Agregamos el nombre del uploader
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Error al obtener los tickets del proyecto.",
    });
  }
};

const cloudinary = require("cloudinary").v2;

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: "djcz7sdvk", // Sustituir por tu cloud name
  api_key:
    "CLOUDINARY_URL=cloudinary://<your_api_key>:<your_api_secret>@djcz7sdvk", // Sustituir por tu API key
  api_secret: "GNPPDA-qdldZZLnfdBQxFKqEig0", // Sustituir por tu API secret
});

// Función para subir la imagen
const uploadImage = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.path);
    return result.url; // Devuelve la URL de la imagen
  } catch (error) {
    throw new Error("Error al subir la imagen a Cloudinary");
  }
};
