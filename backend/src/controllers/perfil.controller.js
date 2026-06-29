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

async function atualizarDados(req, res) {
  try {
    const usuarioId = req.user.id;
    const { nome, telefone, descricao } = req.body;

    if (!nome || nome.trim().length < 2) {
      return res.status(400).json({ message: "Nome Inválido" });
    }

    await pool.query(
      `UPDATE usuarios SET nome = ?, telefone = ?,
       atualizado_em = NOW() WHERE id = ?`,
      [nome, telefone, usuarioId],
    );
    if (req.user.tipo === "prestador" && descricao) {
      await pool.query(
        `UPDATE prestadores SET descricao = ? WHERE usuario_id = ?`,
        [descricao, usuarioId],
      );
    }

    const [linhas] = await pool.query(
      `SELECT usuarios.id, usuarios.nome, usuarios.email, usuarios.telefone, usuarios.tipo,
         prestadores.tipo_servico, prestadores.descricao, prestadores.latitude, prestadores.longitude
         prestadores.ativo FROM usuarios 
         LEFT JOIN prestadores ON prestadores.usuario_id = usuarios.id
         WHERE usuarios.id = ?
        `,
      [usuarioId],
    );

    const dadosAtualizados = linhas[0];

    return res.status(200).json({ message: dadosAtualizados });
  } catch (error) {
    res.status(500).json({ message: "Erro ao realizar atualização dos dados" });
    console.error("ERRO AO REALIZAR ATUALIZAÇÃO DOS DADOS:", error);
  }
}
