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

    const senhaCorreta = await bcrypt.compare(senha, usuario[0].senha);

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

const buscarPrestadoresPorDistancia = async (req, res) => {
  try {
    let lat = parseFloat(req.query.lat);
    let lng = parseFloat(req.query.lng);
    let raio = parseFloat(req.query.raio) || 10;

    if (isNaN(lat) || isNaN(lng)) {
      return res
        .json({ error: "Latitude e longitude são obrigatórios" })
        .status(400);
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.json({ error: "Coordenadas inválidas" }).status(400);
    }

    const query = `SELECT prestadores.*, usuarios.nome FROM prestadores JOIN usuarios ON prestadores.usuario_id = usuarios.id WHERE prestadores.ativo = verdadeiro AND prestadores.latitude IS NOT NULL AND prestadores.longitude IS NOT NULL`;

    const prestadores = [];
    const converterRadianos = (graus) => graus * (Math.PI / 180);

    const calcularDistanciaHaversine = (lat1, lon1, lat2, lon2) => {
      const raioTerra = 6371;

      let dlat = converterRadianos(lat2 - lat1);
      let dlon = converterRadianos(lon2 - lon1);

      let lat1Rad = converterRadianos(lat1);
      let lat2Rad = converterRadianos(lat2);

      let a =
        Math.sin(dlat / 2) * Math.sin(dlng / 2) +
        Math.sin(dlon / 2) *
          Math.sin(dlon / 2) *
          Math.cos(lat1Rad) *
          Math.cos(lat2Rad);
      let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return raioTerra * c;
    };

    const prestadorComDistancia = prestadores.map((prestador) => {
      const distancia = calcularDistanciaHaversine(
        lat,
        lng,
        parseFloat(prestador.lat),
        parseFloat(prestador.lng),
      );
      return { ...prestador, distancia_km: Number(distancia.toFixed(1)) };
    });
    const dentroDoRaio = prestadorComDistancia.filter(
      (p) => p.distancia_km <= raio,
    );

    const ordenados = dentroDoRaio.sort(
      (a, b) => a.distancia_km - b.distancia_km,
    );

    return res.status(200).json(ordenados);
  } catch (error) {
    console.error("Erro em Buscar Prestadores por distancia:", error);
    return res
      .status(500)
      .json({ error: "Erro interno ao buscar prestadores" });
  }
};

module.exports = { cadastrarUsuario, login, buscarPrestadoresPorDistancia };
