const pool = require("../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const cadastrarUsuario = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

const login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res
        .status(400)
        .json({ message: "Email e senha são campos obrigatórios" });
    }
    const [usuario] = await pool.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email],
    );

    if (!usuario) {
      return res.status(401).json({ message: "Email ou senha incorretos" });
    }
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ message: "Email ou senha incorretos" });
    }

    const dadosDoToken = {
      id: usuario.id,
      tipo: usuario.tipo,
    };

    const token = jwt.sign(dadosDoToken, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    return res.status(200).json({ token: token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: "Erro ao concluir processo de login" });
  }
};

module.exports = { cadastrarUsuario, login };
