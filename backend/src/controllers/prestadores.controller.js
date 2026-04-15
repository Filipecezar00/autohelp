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
