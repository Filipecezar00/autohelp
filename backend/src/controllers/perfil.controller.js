import pool from "../config/database";

async function buscarPerfil(req, res) {
  try {
    const usuarioId = req.user.id;

    const [usuarios] = await pool.query(
      `SELECT usuarios.id, usuarios.nome, usuarios.email, usuarios.telefone,
     usuarios.tipo,prestadores.tipo_servico,prestadores.descricao,prestadores.latitude,
     prestadores.longitude,prestadores.ativo FROM usuarios LEFT JOIN prestadores ON prestadores.usuario_id=
     usuarios.id WHERE usuarios.id = ? 
    `,
      [usuarioId],
    );
    if (usuarios.length === 0) {
      res.status(404).json({ message: "Usuário não encontrado" });
    }

    const usuario = usuarios[0];

    return res.status(200).json({ usuario: usuario });
  } catch (error) {
    console.error("DETALHES DO ERRO AO BUSCAR PERFIL DO USUÁRIO:", error);
    res.status(500).json({ message: "Erro ao buscar perfil" });
  }
}
