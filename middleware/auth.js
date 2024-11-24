const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    // Decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar que el decoded contenga el userId correctamente
    console.log("Decoded token:", decoded);

    // Asegurarse de que el ID esté correctamente asignado a req.user
    req.user = decoded; // Aquí es donde asignamos el decoded completo

    next();
  } catch (err) {
    console.error("Error al verificar el token:", err);
    res.status(401).json({ msg: "Token is not valid" });
  }
};
