¡Gracias por señalarlo! Aquí tienes el archivo `README.md` actualizado, que ahora incluye la carpeta `middleware` y el archivo `auth.js` para la autenticación del token JWT:

````markdown
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
````

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

### **Autenticación y Gestión de Usuarios**

#### Registro de Usuario

- **URL:** `/register`
- **Método:** `POST`
- **Cuerpo:**
  ```json
  {
    "email": "usuario@example.com",
    "password": "contraseña_segura",
    "fullName": "Nombre Completo"
  }
  ```
- **Respuestas:**
  - **201:** Usuario registrado exitosamente.
  - **400:** Usuario ya existe.

#### Inicio de Sesión

- **URL:** `/login`
- **Método:** `POST`
- **Cuerpo:**
  ```json
  {
    "email": "usuario@example.com",
    "password": "contraseña_segura"
  }
  ```
- **Respuestas:**
  - **200:** Inicio de sesión exitoso (con token JWT).
  - **401:** Credenciales inválidas.

#### Obtener Perfil

- **URL:** `/profile`
- **Método:** `GET`
- **Encabezado:** `x-auth-token: <token JWT>`
- **Respuestas:**
  - **200:** Datos del perfil del usuario.
  - **404:** Usuario no encontrado.

#### Actualizar Perfil

- **URL:** `/profile/update`
- **Método:** `PUT`
- **Encabezado:** `x-auth-token: <token JWT>`
- **Cuerpo (al menos uno de los campos):**
  ```json
  {
    "name": "Nuevo Nombre",
    "email": "nuevo_email@example.com",
    "password": "nueva_contraseña",
    "photo": "url_de_la_foto"
  }
  ```
- **Respuestas:**
  - **200:** Perfil actualizado exitosamente.
  - **400:** Datos inválidos o correo ya en uso.

#### Eliminar Usuario

- **URL:** `/profile/delete`
- **Método:** `DELETE`
- **Encabezado:** `x-auth-token: <token JWT>`
- **Cuerpo:**
  ```json
  {
    "password": "contraseña_segura"
  }
  ```
- **Respuestas:**
  - **200:** Cuenta eliminada exitosamente.
  - **400:** Contraseña incorrecta.

### **Gestión de Amigos**

#### Agregar Amigo

- **URL:** `/friends/add`
- **Método:** `POST`
- **Encabezado:** `x-auth-token: <token JWT>`
- **Cuerpo:**
  ```json
  {
    "email": "amigo@example.com",
    "name": "Nombre Amigo"
  }
  ```
- **Respuestas:**
  - **200:** Amigo agregado exitosamente.
  - **404:** Amigo no encontrado.

### **Gestión de Proyectos**

#### Crear Proyecto

- **URL:** `/api/projects/create`
- **Método:** `POST`
- **Cuerpo:**
  ```json
  {
    "name": "Nombre del proyecto",
    "description": "Descripción del proyecto"
  }
  ```
- **Respuestas:**
  - **200:** Proyecto creado exitosamente.

#### Agregar Miembro a Proyecto

- **URL:** `/api/projects/add-member`
- **Método:** `POST`
- **Cuerpo:**
  ```json
  {
    "projectId": "id_del_proyecto",
    "memberId": "id_del_miembro"
  }
  ```
- **Respuestas:**
  - **200:** Miembro agregado al proyecto.

#### Eliminar Miembro de Proyecto

- **URL:** `/api/projects/remove-member`
- **Método:** `POST`
- **Cuerpo:**
  ```json
  {
    "projectId": "id_del_proyecto",
    "memberId": "id_del_miembro"
  }
  ```
- **Respuestas:**
  - **200:** Miembro eliminado del proyecto.

#### Obtener Detalles del Proyecto

- **URL:** `/api/projects/details`
- **Método:** `POST`
- **Cuerpo:**
  ```json
  {
    "projectId": "id_del_proyecto"
  }
  ```
- **Respuestas:**
  - **200:** Detalles del proyecto obtenidos correctamente.

#### Obtener Todos los Proyectos de un Usuario

- **URL:** `/api/projects/all`
- **Método:** `GET`
- **Respuestas:**
  - **200:** Lista de proyectos del usuario autenticado.

## Consideraciones

- **Autenticación:** Se requiere un token JWT para acceder a los endpoints protegidos. Este se incluye en el encabezado `x-auth-token`.
- **Middleware:** Se asume que existe un middleware que extrae el `userId` del token JWT.

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

```

### Mejora realizada:
1. **Incorporación del archivo `auth.js`:** Añadí la carpeta `middleware` y el archivo `auth.js` para la autenticación JWT, donde se valida el token y se asegura que el `userId` esté disponible en `req.user`.
```
