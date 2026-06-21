const pool = require("../config/database");

const listar = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT p.id AS prestador_id, p.tipo_servico, p.descricao, p.telefone, p.latitude, p.longitude, u.nome AS nome_prestador, u.email FROM prestador p INNER JOIN usuarios u ON p.usuario_id = u.id WHERE p.ativo =TRUE",
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: "Erro ao buscar prestadores" });
  }
};

const buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM prestadores WHERE id = ?", [
      id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ mensagem: "Prestador não encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensagem: "Erro ao realizar busca do prestador de serviço" });
  }
};

const criar = async (req, res) => {
  try {
    const {
      usuario_id,
      tipo_servico,
      descricao,
      telefone,
      latitude,
      longitude,
    } = req.body;

    if (!usuario_id || !tipo_servico) {
      return res.status(400).json({
        mensagem: "Id do Usuario e tipo de serviço precisam ser preenchidos",
      });
    }
    const [result] = await pool.query(
      `INSERT INTO prestadores (usuario_id, tipo_servico,descricao,telefone,latitude,longitude) VALUES(?,?,?,?,?,?)`,
      [usuario_id, tipo_servico, descricao, telefone, latitude, longitude],
    );

    res.status(201).json({
      mensagem: "Prestador cadastrado com sucesso",
      id: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: "Erro ao cadastrar prestador" });
  }
};

const gerarLocalizacao = async (req, res) => {
  try {
    const { latitude, longitude, tipo_servico } = req.body;
    const usuarioId = req.user.id;

    await pool.query(
      `UPDATE prestadores SET latitude = ?, longitude=?, tipo_servico=?, ativo=? WHERE usuario_id = ?`,
      [latitude, longitude, tipo_servico, true, usuarioId],
    );

    return res
      .status(200)
      .json({ message: "Perfil e Localização ativados com sucesso!" });
  } catch (error) {
    console.log("ERRO AO ATIVAR PERFIL: ", error);
    return res.status(500).json({ message: "Erro interno no servidor" });
  }
};

const salvarOnboarding = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Token inválido" });
    }
    let usuario_id = req.user.id;

    const dados_formulario = req.body;
    let tipo_servico = dados_formulario.tipo_servico;
    let descricao = dados_formulario.descricao;
    let telefone = dados_formulario.telefone;
    let latitude = dados_formulario.latitude;
    let longitude = dados_formulario.longitude;

    if (!tipo_servico || !latitude || !longitude) {
      return res.status(400).json({ message: "Dados obrigatórios faltando" });
    }

    await pool.query(
      `INSERT INTO prestador (usuario_id,tipo_servico,descricao,telefone,latitude,longitude,ativo) VALUES(?,?,?,?,?,?,?)`,
      [
        usuario_id,
        tipo_servico,
        descricao,
        telefone,
        latitude,
        longitude,
        true,
      ],
    );

    await pool.query(`UPDATE usuarios SET tipo = 'prestador'  WHERE id=?`, [
      usuario_id,
    ]);

    return res.status(201).json({ message: "Perfil configurado com sucesso!" });
  } catch (erro) {
    console.error("Erro Crítico:", erro);
    return res.status(500).json({ message: "Erro ao salvar dados" });
  }
};

module.exports = { listar, buscarPorId, criar, gerarLocalizacao };
