const pool = require("../config/database");

const listar = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM prestadores WHERE ativo = TRUE",
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
    const { latitude, longitude, status } = req.body;
    const usuarioId = req.user.id;

    await pool.query(
      `UPDATE prestadores SET latitude = ?, longitude=?, status=? WHERE usuario_id = ?`,
      [latitude, longitude, status, usuarioId],
    );

    return res.status(200).json({ message: "Localização gerada com sucesso." });
  } catch (error) {
    console.log("ERRO AO GERAR LOCALIZAÇÃO DO PRESTADOR: ", error);
    return res
      .status(500)
      .json({ message: "Erro ao gerar localização do prestador" });
  }
};

module.exports = { listar, buscarPorId, criar, gerarLocalizacao };
