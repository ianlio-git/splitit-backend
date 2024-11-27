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
    // Verificar si req.user existe (el token del usuario autenticado)
    if (!req.user) {
      console.log("No se encontró el usuario autenticado");
      return res.status(401).json({
        msg: "No se pudo encontrar el token del usuario autenticado.",
      });
    }

    // Obtener los datos de la solicitud
    const { projectId, description, date, image, amount, distribution } =
      req.body;
    console.log("Datos recibidos:", {
      projectId,
      description,
      date,
      image,
      amount,
      distribution,
    });
    // Verificar si el projectId está presente
    if (!projectId) {
      console.log("No se proporcionó el ID del proyecto");
      return res.status(400).json({
        msg: "El ID del proyecto es obligatorio.",
      });
    }

    // Log para ver los datos que están llegando en la solicitud
    console.log("Datos recibidos:", {
      projectId,
      description,
      date,
      image,
      amount,
      distribution,
    });

    // Buscar el proyecto en la base de datos y populamos los miembros
    const project = await Project.findById(projectId).populate("members");

    // Verificar si el proyecto existe
    if (!project) {
      console.log("El proyecto no existe.");
      return res.status(404).json({
        msg: "El proyecto no existe.",
      });
    }

    // Verificar si el usuario está asociado al proyecto
    const userIsMember = project.members.some(
      (member) => member._id.toString() === req.user.userId
    );

    if (!userIsMember) {
      console.log("El usuario no pertenece al proyecto.");
      return res.status(403).json({
        msg: "El usuario no pertenece a este proyecto.",
      });
    }

    // Crear el ticket
    const ticket = new Ticket({
      uploader: req.user.userId, // Usamos el ID del usuario que sube el ticket
      projectId: projectId,
      description,
      date,
      image,
      amount,
      distribution,
    });

    // Log para ver el objeto del ticket antes de guardarlo
    console.log("Creando ticket:", ticket);

    // Guardar el ticket en la base de datos
    const savedTicket = await ticket.save();

    // Log para verificar que el ticket se guardó correctamente
    console.log("Ticket guardado:", savedTicket);

    // Asociar el ticket al proyecto
    project.tickets.push(savedTicket._id);
    await project.save();

    // Responder con el ticket creado
    res.status(201).json({
      msg: "Ticket creado exitosamente.",
      ticket: savedTicket,
    });
  } catch (error) {
    // Log del error
    console.error("Error al crear el ticket:", error);
    res.status(500).json({
      msg: "Error al crear el ticket.",
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
