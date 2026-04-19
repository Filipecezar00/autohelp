const pool = require("../config/database");
const bcrypt = require("bcrypt");

const cadastrarUsuario = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).send("Todos os campos são obrigatórios");
    }

    const [existente] = await pool.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email],
    );
    if (existente.length > 0) {
      return res.status(409).json({ message: "Email já cadastrado" });
    }

    if (senha.length < 6) {
      return res
        .status(400)
        .json({ message: "Senha muito curta, tente outra." });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Email inválido" });
    }

    const saltRounds = 10;
    const senhaProtegida = await bcrypt.hash(senha, saltRounds);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    await pool.query(`INSERT INTO usuarios(nome,email,senha) VALUES(?,?,?)`, [
      nome,
      email,
      senhaProtegida,
    ]);

    return res.status(201).json({ message: "Usuário cadastrado com sucesso" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro interno no servidor" });
  }
};
module.exports = { cadastrarUsuario };
