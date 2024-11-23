const mongoose = require("mongoose");

/**
 * Definimos el esquema del proyecto.
 * @typedef {Object} Project
 * @property {string} name - El nombre del proyecto.
 * @property {string} description - La descripción del proyecto.
 * @property {ObjectId} owner - Referencia al usuario propietario del proyecto.
 * @property {Array<ObjectId>} members - Lista de miembros del proyecto.
 * @property {Array<ObjectId>} tickets - Lista de tickets asociados al proyecto.
 * @property {Date} createdAt - Fecha de creación del proyecto.
 * @property {Date} updatedAt - Fecha de última actualización del proyecto.
 */
const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // El nombre del proyecto es obligatorio
    },
    description: {
      type: String,
      required: false, // La descripción no es obligatoria
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId, // Referencia a un usuario (dueño del proyecto)
      ref: "User", // Hace referencia al modelo "User"
      required: true, // El propietario es obligatorio
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId, // Referencia a los miembros del proyecto
        ref: "User", // Relación con el modelo "User"
        required: false, // Los miembros no son obligatorios
      },
    ],
    tickets: [
      {
        type: mongoose.Schema.Types.ObjectId, // Referencia a los tickets del proyecto
        ref: "Ticket", // Relación con el modelo "Ticket" (si existe)
        required: false, // Los tickets no son obligatorios
      },
    ],
  },
  {
    timestamps: true, // Esto agrega automáticamente los campos `createdAt` y `updatedAt`
  }
);

/**
 * Modelo de proyecto basado en el esquema definido.
 * @type {mongoose.Model<Project>}
 */
const Project = mongoose.model("Project", projectSchema);

// Exportar el modelo
module.exports = Project;
