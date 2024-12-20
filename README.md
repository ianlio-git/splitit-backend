# API de Gestión de Usuarios, Proyectos y Tickets con Node.js

Este proyecto implementa una API RESTful en Node.js para la gestión de usuarios, proyectos y tickets. Permite funciones de autenticación, registro, gestión de perfiles, y relaciones entre usuarios, como agregar amigos. La API también incluye la creación, administración y eliminación de proyectos y tickets.

## Dependencias

- **bcryptjs**: Para el hash y la verificación de contraseñas.
- **cloudinary**: Para subir y gestionar imágenes en Cloudinary.
- **dotenv**: Para cargar variables de entorno desde un archivo `.env`.
- **express**: Framework web para Node.js.
- **jsonwebtoken**: Para generar y verificar tokens JWT.
- **mongoose**: Para interactuar con la base de datos MongoDB.
- **nodemailer**: Para enviar correos electrónicos.
- **@sendgrid/mail**: Para enviar correos electrónicos usando SendGrid.

## Dependencias de Desarrollo

- **nodemon**: Para reiniciar automáticamente el servidor cuando se detectan cambios en los archivos.

## Requisitos Previos

Antes de ejecutar este proyecto, asegúrate de tener instalados los siguientes programas:

- Node.js (versión 14 o superior)
- MongoDB (versión 4 o superior)

Además, necesitarás un archivo `.env` configurado con las siguientes variables:

- JWT_SECRET: Clave secreta para firmar tokens JWT.
- SENDGRID_API_KEY: Clave API de SendGrid para enviar correos electrónicos.
- FRONTEND_URL: URL del frontend para generar enlaces de reseteo de contraseña.
- CLOUDINARY_CLOUD_NAME: Nombre de tu cuenta de Cloudinary.
- CLOUDINARY_API_KEY: Clave API de Cloudinary.
- CLOUDINARY_API_SECRET: Clave secreta de Cloudinary.

## Instalación

Sigue estos pasos para instalar y ejecutar el proyecto:

1. Clona el repositorio en tu máquina local:

   ```bash
   git clone `https://github.com/ianlio-git/splitit-backend.git`
   cd splitit-backend
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Configura el archivo `.env`:
   Crea un archivo `.env` en la raíz del proyecto y añade la siguiente variable:

   ```env
   JWT_SECRET=tu_clave_secreta
   SENDGRID_API_KEY=tu_clave_api_de_sendgrid
   FRONTEND_URL=https://tuaplicacion.com
   CLOUDINARY_CLOUD_NAME=tu_cloud_name
   CLOUDINARY_API_KEY=tu_api_key
   CLOUDINARY_API_SECRET=tu_api_secret
   ```

4. Inicia el servidor:
   ```bash
   npm start
   ```

---

## Comentarios

1. **Incorporación del archivo `auth.js`:** Se añadió la carpeta `middleware` y dentro de ella el archivo `auth.js`, el cual se encarga de la autenticación JWT. Este archivo tiene varias responsabilidades clave:

   - **Validación del Token:** Verifica que el token JWT proporcionado en las solicitudes sea válido y no haya sido manipulado.
   - **Duración del Token:** Asegura que el token tenga una duración de 1 hora, después de la cual expira y el usuario deberá autenticarse nuevamente.
   - **Disponibilidad del `userId`:** Extrae el `userId` del token JWT y lo coloca en `req.user`, asegurando que esté disponible para su uso en las rutas protegidas. Esto permite que las rutas autenticadas puedan acceder fácilmente al ID del usuario autenticado sin necesidad de realizar consultas adicionales a la base de datos.

   Este archivo es esencial para proteger las rutas de la API y garantizar que solo los usuarios autenticados puedan acceder a ellas.

---

## Endpoints

# API Documentation

Este documento detalla las rutas disponibles para interactuar con la API, organizadas por módulos: **USERS**, **FRIENDS**, **PROJECTS**, y **TICKETS**.

---

## USERS

### 1. Obtener respuesta

**GET**: `http://localhost:4000/api/users/response`

---

### 2. Obtener todos los usuarios

**GET**: `http://localhost:4000/api/users/users`

---

### 3. Iniciar sesión

**POST**: `http://localhost:4000/api/users/login`

**Body**:
.json

```
{
"email": "prueba@ejemplo.com",
"password": "1234"
}
```

---

### 4. Registrar usuario

**POST**:`http://localhost:4000/api/users/register`

**Body**:
.json

```
{
"name": "usuario1",
"email": "usuario2@ejemplo.com",
"password": "1234"
}
```

---

### 5. Ver perfil

**GET**: `http://localhost:4000/api/users/profile`

**Header**: `x-auth-token: <token>`

---

### 6. Actualizar perfil

**PUT**: `http://localhost:4000/api/users/update`

**Header**: `x-auth-token: <token>`

**Body**:
.json

```
{
"name": "pablo",
"lastname": "pablo",
"email": "prueba@ejemplo.com",
"password": "1234",
"photo": "https://nuevoenlacefoto.com"
}
```

---

### 7. Eliminar usuario

**DELETE**: `http://localhost:4000/api/users/delete`

**Header**: `x-auth-token: <token>`

**Body**:
.json

```
{
"password": "1234"
}
```

---

### 8. Enviar correo de restablecimiento

**POST**: `http://localhost:4000/api/users/reset`

**Body**:
.json

```
{
"email": "ianlionetti17@gmail.com"
}
```

---

### 9. Cambiar contraseña

**POST**: `http://localhost:4000/api/users/change-password`

**Header**: `x-auth-token: <token>`

**Body**:
.json

```
{
"newPassword": "123456"
}
```

---

### FRIENDS

---

### 1. Mostrar amigos

**GET**: `http://localhost:4000/api/users/friends`

**Header**: `x-auth-token: <token>`

---

### 2. Agregar amigo

**POST**: `http://localhost:4000/api/users/add-friend`

**Header**: `x-auth-token: <token>`

**Body**:
.json

```
{
"email": "usuario2@ejemplo.com",
"name": "carlos"
}
```

---

### 3. Eliminar amigo

**POST**: `http://localhost:4000/api/users/remove-friend`

**Header**: `x-auth-token: <token>`

**Body**:
.json

```
{
"email": "usuario2@ejemplo.com"
}
```

---

### PROJECTS

---

### 1. Obtener test de proyectos

**GET**: `http://localhost:4000/api/projects/test`

---

### 2. Crear proyecto

**POST**: `http://localhost:4000/api/projects/create`

**Header**: x-auth-token: <token>

**Body**:
.json

```
{
"name": "Mi nuevo proyecto 2",
"description": "Descripción del proyecto 2"
}
```

---

### 3. Agregar miembro al proyecto

**POST**: `http://localhost:4000/api/projects/add-members`

**Header**: `x-auth-token: <token>`

**Body**:
.json

```
{
"projectId": "674225d71fde707adbe6f7ee",
"memberId": "6741dad00c2a4ccd854ca415"
}
```

---

### 4. Obtener detalles de un proyecto (proyecto principal)

**POST**: `http://localhost:4000/api/projects/post-details`

**Header**: `x-auth-token: <token>`

**Body**:
.json

```
{
"projectId": "674225d71fde707adbe6f7ee"
}
```

---

### 5. Mostrar todos los proyectos de la cuenta

**GET**: `http://localhost:4000/api/projects/get-all`

**Header**: `x-auth-token: <token>`

---

### 6. Eliminar miembro de proyecto

**DELETE**: `http://localhost:4000/api/projects/delete-member`

**Header**: `x-auth-token: <token>`

**Body**:
.json

```
{
"projectId": "674378116ed19c37bd4085c2",
"memberId": "6742b6b6af44843cfee9ffdb"
}
```

`Nota: Solo el propietario del proyecto puede borrar miembros.`

---

### 7. Eliminar proyecto

**DELETE**: `http://localhost:4000/api/projects/delete-project`

**Header**: `x-auth-token: <token>`

**Body**:
.json

```
{
"projectId": "674378116ed19c37bd4085c2"
}
```

---

`Nota: Solo el propietario del proyecto puede eliminar el proyecto.`

---

### TICKETS

---

### 1. Test

**GET**: `http://localhost:4000/api/tickets/test`

`Descripción: Prueba de ruta para verificar el funcionamiento de la API de tickets.`

---

### 2. Crear Ticket

**POST**: `http://localhost:4000/api/tickets/create`

**Header**: `x-auth-token: <token>`

**Body**:
.json

```
{
"projectId": "ID_DEL_PROYECTO",
"description": "Descripción del ticket",
"date": "2024-11-24",
"image": "URL_DE_IMAGEN",
"amount": 1000,
"distribution": "Distribución de recursos"
}
```

---

### 3. Eliminar Ticket

**DELETE**: `http://localhost:4000/api/tickets/delete`

**Header**: `x-auth-token: <token>`

**Body**:
.json

```
{
"ticketId": "ID_DEL_TICKET"
}
```

---

### 4. Obtener Tickets de un Proyecto

**POST**: `http://localhost:4000/api/tickets/get-tikets`

**Header**: `x-auth-token: <token>`

**Body**:
.json

```
{
"projectId": "ID_DEL_PROYECTO"
}
```

---

## Estructura del Proyecto

```
src/
├── controllers/
│   ├── user.controller.js   # Controladores para usuarios y autenticación
│   ├── project.controller.js # Controladores para la gestión de proyectos
├── models/
│   ├── user.model.js        # Modelo de Usuario
│   ├── project.model.js     # Modelo de Proyecto
├── routes/
│   ├── user.routes.js       # Rutas para la gestión de usuarios
│   ├── project.routes.js    # Rutas para la gestión de proyectos
├── middleware/
│   ├── auth.js              # Middleware para la autenticación del token JWT
├── app.js                   # Configuración principal de la aplicación
├── .env                     # Configuración de variables de entorno
└── server.js                # Punto de entrada de la aplicación
```

## Contribuciones

1. Haz un fork del repositorio.
2. Crea una rama para tu nueva funcionalidad (`git checkout -b feature/funcionalidad-nueva`).
3. Realiza tus cambios y haz un commit (`git commit -am 'Añade nueva funcionalidad'`).
4. Haz push a tu rama (`git push origin feature/funcionalidad-nueva`).
5. Abre un Pull Request.

## Licencia

Este proyecto está bajo la es para uso educativo de `UADE`.
