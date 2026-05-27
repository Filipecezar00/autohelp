const jwt = require("jsonwebtoken");

const autenticarToken = async (req, res, next) => {
  const cabecalho = req.headers.authorization;
  if (!cabecalho) {
    return res.status(401).json({ message: "Token não fornecido" });
  }
  const partes = cabecalho.split(" ");
  const token = partes[1];

  if (!token) {
    return res.status(401).json({ message: "Formato de token inválido" });
  }

  try {
    const dadosDoUsuario = jwt.verify(token, process.env.JWT_SECRET);
    req.user = dadosDoUsuario;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Token inválido ou expirado" });
  }
};

module.exports = autenticarToken;
