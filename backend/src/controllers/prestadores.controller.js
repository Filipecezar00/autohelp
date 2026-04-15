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
