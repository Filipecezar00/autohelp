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
    console.error("Erro no cadastro:" + error);
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

    const [usuarios] = await pool.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email],
    );

    if (usuarios.length === 0) {
      return res.status(401).json({ message: "Email ou senha incorretos" });
    }

    const usuarioEncontrado = usuarios[0];

    const senhaCorreta = await bcrypt.compare(senha, usuarioEncontrado.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ message: "Email ou senha incorretos" });
    }

    const dadosDoToken = {
      id: usuarioEncontrado.id,
      tipo: usuarioEncontrado.tipo,
    };

    if (!process.env.JWT_SECRET) {
      throw new Error("A variável JWT_SECRET não foi definida no arquivo .env");
    }

    const token = jwt.sign(dadosDoToken, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    return res.status(200).json({ token: token });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao concluir processo de login" });
  }
};

const buscarPrestadoresPorDistancia = async (req, res) => {
  try {
    let lat = parseFloat(req.query.lat);
    let lng = parseFloat(req.query.lng);
    let raio = parseFloat(req.query.raio) || 10;

    if (isNaN(lat) || isNaN(lng)) {
      return res
        .status(400)
        .json({ error: "Latitude e longitude são obrigatórios" });
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ error: "Coordenadas inválidas" });
    }

    console.log("LOG DO BACKEND");
    console.log("Latitude recebida:", lat, "Tipo:", typeof lat);
    console.log("Longitude recebida:", lng, "Tipo:", typeof lng);
    console.log("Raio recebido: ", raio, "Tipo:", typeof raio);

    const query = `SELECT prestadores.*, usuarios.nome FROM prestadores JOIN usuarios ON prestadores.usuario_id = usuarios.id WHERE prestadores.ativo = TRUE AND prestadores.latitude IS NOT NULL AND prestadores.longitude IS NOT NULL`;

    const [prestadores] = await pool.query(query);
    const converterRadianos = (graus) => graus * (Math.PI / 180);

    const calcularDistanciaHaversine = (lat1, lon1, lat2, lon2) => {
      const raioTerra = 6371;

      let dlat = converterRadianos(lat2 - lat1);
      let dlon = converterRadianos(lon2 - lon1);

      let lat1Rad = converterRadianos(lat1);
      let lat2Rad = converterRadianos(lat2);

      let a =
        Math.sin(dlat / 2) * Math.sin(dlat / 2) +
        Math.sin(dlon / 2) *
          Math.sin(dlon / 2) *
          Math.cos(lat1Rad) *
          Math.cos(lat2Rad);
      a = Math.min(1, a);
      let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return raioTerra * c;
    };

    const filtrados = prestadores.filter((prestador) => {
      const latBanco = parseFloat(prestador.latitude);
      const lngBanco = parseFloat(prestador.longitude);

      if (isNaN(latBanco) || isNaN(lngBanco)) {
        return false;
      }

      const distancia = calcularDistanciaHaversine(
        lat,
        lng,
        latBanco,
        lngBanco,
      );

      console.log(
        `Prestador ID: ${prestador.id} (${prestador.nome}: Distância = ${distancia.toFixed(2)}) km`,
      );

      return distancia <= raio;
    });

    return res.status(200).json(filtrados);
  } catch (error) {
    console.error("Erro crítico no controlador:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
};

module.exports = { cadastrarUsuario, login, buscarPrestadoresPorDistancia };
