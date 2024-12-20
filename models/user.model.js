const mongoose = require("mongoose");

/**
 * Definimos el esquema del usuario.
 * @typedef {Object} User
 * @property {string} email - El correo electrónico del usuario. Es obligatorio y debe ser único.
 * @property {string} password - La contraseña del usuario. Es obligatoria.
 * @property {string} [name] - El nombre del usuario. No es obligatorio.
 * @property {string} [lastname] - El apellido del usuario. No es obligatorio.
 * @property {string} [photo] - La foto del usuario. No es obligatoria.
 * @property {Array<ObjectId>} [projects] - Lista de proyectos asociados al usuario. No es obligatorio.
 * @property {Array<ObjectId>} [friends] - Lista de amigos del usuario. No es obligatorio.
 * @property {Date} createdAt - Fecha de creación del usuario.
 * @property {Date} updatedAt - Fecha de última actualización del usuario.
 */
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true, // El email es obligatorio
      unique: true, // El email debe ser único
    },
    password: {
      type: String,
      required: true, // La contraseña es obligatoria
    },
    name: {
      type: String,
      required: false, // El nombre no es obligatorio
    },
    lastname: {
      type: String,
      required: false, // El apellido no es obligatorio
    },
    photo: {
      type: String,
      required: false, // La foto no es obligatoria
    },
    projects: [
      {
        type: mongoose.Schema.Types.ObjectId, // Referencia a otros documentos
        ref: "Project", // Asumimos que hay un modelo 'Project' que se relaciona
        required: false, // Los proyectos no son obligatorios
      },
    ],
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId, // Referencia a otros usuarios
        ref: "User", // Relación con el modelo de usuario
        required: false, // No es obligatorio tener amigos
      },
    ],
  },
  {
    timestamps: true, // Esto agrega automáticamente los campos `createdAt` y `updatedAt`
  }
);

/**
 * Modelo de usuario basado en el esquema definido.
 * @type {mongoose.Model<User>}
 */
const User = mongoose.model("User", userSchema);

// Exportar el modelo
module.exports = User;
