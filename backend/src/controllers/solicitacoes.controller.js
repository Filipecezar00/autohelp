async function criarSolicitacao(req, res) {
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

async function listarSolicitacoesDoCliente(req, res) {
  try {
    const clienteId = req.usuario.id;

    const [solicitacoes] = await pool.query(
      `SELECT solicitacoes.*,
        usuarios.nome AS nome_prestador,
        prestadores.tipo_servico,
        prestadores.telefone FROM solicitacoes
        JOIN prestadores ON solicitacoes.prestador_id = prestadores.id
        JOIN usuarios ON prestadores.usuario_id = usuarios.id
        WHERE solicitacoes.cliente_id = ? ORDER BY solicitacoes.criado_em DESC`,
      [clienteId],
    );
    return res.status(200).json(solicitacoes);
  } catch (error) {
    console.error("Erro no Banco ao listar Solicitações:", error);
    return res.status(500).json("Erro ao Buscar Solicitações");
  }
}

async function listarSolicitacoesDoPrestador(req, res) {
  try {
    const usuarioId = req.usuario.id;

    const [Resultadoprestador] = await pool.query(
      "SELECT id FROM prestadores WHERE usuario_id = ?",
      [usuarioId],
    );

    if (Resultadoprestador.length === 0) {
      return res
        .status(404)
        .json({ message: "Perfil de Prestador não Encontrado" });
    }

    const prestador = Resultadoprestador[0];

    const [solicitacoes] = await pool.query(
      `SELECT solicitacoes.*,
              usuarios.nome AS nome_cliente,
              usuarios.email AS email_cliente
              FROM solicitacoes JOIN usuarios ON 
              solicitacoes.cliente_id = usuarios.id WHERE
              solicitacoes.prestador_id = ?
              ORDER BY CASE status WHEN 'pendente'
              THEN 1 WHEN 'aceita' THEN 2 ELSE 3 END,
              solicitacoes.criado_em DESC`,
      [prestador.id],
    );

    return res.status(200).json(solicitacoes);
  } catch (error) {
    console.error("Erro ao buscar as solicitações do prestador:", error);
    return res.status(500).json({ message: "Erro ao buscar Solicitações" });
  }
}

async function atualizarStatus(req, res) {
  try {
    const solicitacaoId = req.params.id;
    const novoStatus = req.body.status;
    const usuarioId = req.usuario.id;

    const statusPermitidos = ["aceita", "recusada", "concluida", "cancelada"];

    if (!statusPermitidos.includes(novoStatus)) {
      return res.status(400).json({ message: "status inválido" });
    }
    const [ResultadoSolicitacao] = await pool.query(
      `
  SELECT solicitacoes.*, 
  prestadores.usuario_id
  AS prestador_usuario_id
  FROM solicitacoes JOIN prestadores ON 
  solicitacoes.prestador_id = prestadores.id 
  WHERE solicitacoes.id = ? 
  `,
      [solicitacaoId],
    );

    if (ResultadoSolicitacao.length === 0) {
      return res.status(404).json({ message: "solicitação não encontrada" });
    }

    const solicitacao = ResultadoSolicitacao[0];

    if (novoStatus === "cancelada") {
      if (solicitacao.cliente_id !== usuarioId) {
        return res
          .status(403)
          .json({ message: "Apenas o cliente Pode Cancelar" });
      }
    }
    if (["aceita", "recusada", "concluida"].includes(novoStatus)) {
      if (solicitacao.prestador_usuario_id !== usuarioId) {
        return res
          .status(403)
          .json({ message: "Apenas o prestador pode executar esta ação" });
      }
    }
    const transicoesValidas = {
      pendente: ["aceita", "recusada", "cancelada"],
      aceita: ["concluida", "cancelada"],
      recusada: [],
      concluida: [],
      cancelada: [],
    };
    const transicoesPermitidas = transicoesValidas[solicitacao.status];

    if (!transicoesPermitidas.includes(novoStatus)) {
      return res.status(422).json({ message: "Transição de status inválida" });
    }

    await pool.query(
      `UPDATE solicitacoes 
       SET status = ?, atualizado_em = NOW()
       WHERE id = ? 
    `,
      [novoStatus, solicitacaoId],
    );

    return res
      .status(200)
      .json({ mensagem: "Status atualizado", status: novoStatus });
  } catch (error) {
    console.error("Erro ao executar atualização de status: ", error);
    return res.status(500).json({ message: "Erro ao atualizar status" });
  }
}
