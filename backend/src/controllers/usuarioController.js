const pool = require("../config/database");
const bcrypt = require("bcrypt");

const cadastrarUsuario = async (req, res) => {
  try {
    const { dados, nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).send("Todos os campos são obrigatórios");
    }

    const [existente] = await pool.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email],
    );
    if (existente.length > 0) {
      return res.status(409).send("Email já cadastrado");
    }

    const saltRounds = 10;
    const senhaProtegida = await bcrypt.hash(senha, saltRounds);

    await pool.query(`INSERT INTO usuarios(nome,email,senha) VALUES(?,?,?)`, [
      nome,
      email,
      senhaProtegida,
    ]);

    return res.status(201).send("Usuário cadastrado com sucesso");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Erro interno no servidor");
  }
};
module.exports = { cadastrarUsuario };
