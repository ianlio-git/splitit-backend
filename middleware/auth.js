const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Asegúrate de asignar el token decodificado a req.user
    next();
  } catch (err) {
    console.error("Error al verificar el token:", err);
    res.status(401).json({ msg: "Token is not valid" });
  }
};
