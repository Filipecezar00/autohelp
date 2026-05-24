async function criarSolicitação(req, res) {
  try {
    const clienteId = req.usuario.id;
    const prestadorId = req.body.prestador_id;
    const descricao = req.body.descricao;

    if (!prestadorId) {
      return res.status(400).json({ message: "O prestador é obrigatorio" });
    }

    const [prestadoresEncontrados] = await pool.query(
      "SELECT * FROM prestadores WHERE id = ? AND ativo = TRUE",
      [prestadorId],
    );

    if (prestadoresEncontrados.length === 0) {
      return res
        .status(404)
        .json({ message: "Prestador não encontrado ou inativo" });
    }

    const [solicitacaoExistente] = await pool.query(
      "SELECT * FROM solicitacoes WHERE cliente_id = ? AND prestador_id = ? AND status IN ('pendente','aceita')",
      [clienteId, prestadorId],
    );

    if (solicitacaoExistente.length > 0) {
      return res.status(409).json({
        message: "Você já tem uma solicitação ativa com este prestador",
      });
    }

    const [resultado] = await pool.query(
      "INSERT INTO solicitacoes (cliente_id,prestador_id,descricao,status) VALUES (?,?,?,'pendente')",
      [clienteId, prestadorId, descricao],
    );

    return res.status(201).json({
      mensagem: "Solicitação enviada com sucesso",
      id: resultado.insertId,
    });
  } catch (error) {
    console.error("Erro interno:", error);
    res.status(500).json({ message: "Erro ao Criar Solicitação" });
  }
}
