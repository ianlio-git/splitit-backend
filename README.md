# Gestión de Usuarios y Proyectos con Node.js

Este proyecto implementa una API RESTful en Node.js para la gestión de usuarios y proyectos. Permite funciones de autenticación, registro, gestión de perfiles, y relaciones entre usuarios, como agregar amigos. La API también incluye la creación, administración y eliminación de proyectos.

## Requisitos Previos

Antes de ejecutar este proyecto, asegúrate de tener instalados los siguientes programas:

- [Node.js](https://nodejs.org/) (versión 14 o superior)
- [MongoDB](https://www.mongodb.com/) (versión 4 o superior)

Además, necesitarás un archivo `.env` configurado con las siguientes variables:

- `JWT_SECRET`: Clave secreta para firmar tokens JWT.

## Instalación

Sigue estos pasos para instalar y ejecutar el proyecto:

1. Clona el repositorio en tu máquina local:

   ```bash
   git clone https://github.com/tuusuario/nombre-del-repo.git
   cd nombre-del-repo
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Configura el archivo `.env`:
   Crea un archivo `.env` en la raíz del proyecto y añade la siguiente variable:

   ```env
   JWT_SECRET=tu_clave_secreta
   ```

4. Inicia el servidor:
   ```bash
   npm start
   ```

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

```
json
{
"email": "prueba@ejemplo.com",
"password": "1234"
}
```

### 4. Registrar usuario

**POST**: http://localhost:4000/api/users/register

**Body**:

```
{
"name": "usuario1",
"email": "usuario2@ejemplo.com",
"password": "1234"
}
```

### 5. Ver perfil

**GET**: http://localhost:4000/api/users/profile

**Header**: x-auth-token: <token>

### 6. Actualizar perfil

**PUT**: http://localhost:4000/api/users/update

**Header**: x-auth-token: <token>

**Body**:

```
{
"name": "pablo",
"lastname": "pablo",
"email": "prueba@ejemplo.com",
"password": "1234",
"photo": "https://nuevoenlacefoto.com"
}
```

### 7. Eliminar usuario

**DELETE**: http://localhost:4000/api/users/delete

**Header**: x-auth-token: <token>

**Body**:

```
{
"password": "1234"
}
```

### 8. Enviar correo de restablecimiento

**POST**: http://localhost:4000/api/users/reset

**Body**:

```
{
"email": "ianlionetti17@gmail.com"
}
```

### 9. Cambiar contraseña

POST: http://localhost:4000/api/users/change-password

**Header**: x-auth-token: <token>

**Body**:

```
{
"newPassword": "123456"
}
```

### FRIENDS

### 1. Mostrar amigos

**GET**: http://localhost:4000/api/users/friends

**Header**: x-auth-token: <token>

### 2. Agregar amigo

**POST**: http://localhost:4000/api/users/add-friend

**Header**: x-auth-token: <token>

**Body**:

```
{
"email": "usuario2@ejemplo.com",
"name": "carlos"
}
```

### 3. Eliminar amigo

**POST**: http://localhost:4000/api/users/remove-friend

**Header**: x-auth-token: <token>

**Body**:

```
{
"email": "usuario2@ejemplo.com"
}
```

### PROJECTS

### 1. Obtener test de proyectos

**GET**: http://localhost:4000/api/projects/test

### 2. Crear proyecto

**POST**: http://localhost:4000/api/projects/create

**Header**: x-auth-token: <token>

**Body**:

```
{
"name": "Mi nuevo proyecto 2",
"description": "Descripción del proyecto 2"
}
```

### 3. Agregar miembro al proyecto

**POST**: http://localhost:4000/api/projects/add-members

**Header**: x-auth-token: <token>

**Body**:

```
{
"projectId": "674225d71fde707adbe6f7ee",
"memberId": "6741dad00c2a4ccd854ca415"
}
```

### 4. Obtener detalles de un proyecto (proyecto principal)

**POST**: http://localhost:4000/api/projects/post-details

**Header**: x-auth-token: <token>

**Body**:

```
{
"projectId": "674225d71fde707adbe6f7ee"
}
```

### 5. Mostrar todos los proyectos de la cuenta

**GET**: http://localhost:4000/api/projects/get-all

**Header**: x-auth-token: <token>

### 6. Eliminar miembro de proyecto

DELETE: http://localhost:4000/api/projects/delete-member

**Header**: x-auth-token: <token>

**Body**:

```
{
"projectId": "674378116ed19c37bd4085c2",
"memberId": "6742b6b6af44843cfee9ffdb"
}
```

`Nota: Solo el propietario del proyecto puede borrar miembros.`

### 7. Eliminar proyecto

**DELETE**: http://localhost:4000/api/projects/delete-project

**Header**: x-auth-token: <token>

**Body**:

```
{
"projectId": "674378116ed19c37bd4085c2"
}
```

`Nota: Solo el propietario del proyecto puede eliminar el proyecto.`

### TICKETS

### 1. Test

**GET**: http://localhost:4000/api/tickets/test

`Descripción: Prueba de ruta para verificar el funcionamiento de la API de tickets.`

### 2. Crear Ticket

**POST**: http://localhost:4000/api/tickets/create

**Header**: x-auth-token: <token>

**Body**:

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

### 3. Eliminar Ticket

**DELETE**: http://localhost:4000/api/tickets/delete

**Header**: x-auth-token: <token>

**Body**:

```
{
"ticketId": "ID_DEL_TICKET"
}
```

### 4. Obtener Tickets de un Proyecto

**POST**: http://localhost:4000/api/tickets/get-tikets

**Header**: x-auth-token: <token>

**Body**:

```
{
"projectId": "ID_DEL_PROYECTO"
}
```

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

## Dependencias

- **bcryptjs:** Para el hash y la verificación de contraseñas.
- **jsonwebtoken:** Para generar y verificar tokens JWT.
- **mongoose:** Para interactuar con la base de datos MongoDB.

## Contribuciones

1. Haz un fork del repositorio.
2. Crea una rama para tu nueva funcionalidad (`git checkout -b feature/funcionalidad-nueva`).
3. Realiza tus cambios y haz un commit (`git commit -am 'Añade nueva funcionalidad'`).
4. Haz push a tu rama (`git push origin feature/funcionalidad-nueva`).
5. Abre un Pull Request.

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.

### Mejora realizada:

1. **Incorporación del archivo `auth.js`:** Añadí la carpeta `middleware` y el archivo `auth.js` para la autenticación JWT, donde se valida el token y se asegura que el `userId` esté disponible en `req.user`.
