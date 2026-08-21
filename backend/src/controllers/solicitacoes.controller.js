const pool = require("../config/database");
async function criarSolicitacao(req, res) {
  try {
    const clienteId = req.user.id;
    const prestadorId = req.body.prestador_id;
    const descricao = req.body.descricao;
    const pool = require("../config/database");
    const io = req.app.get("io");

    const tempoAtual = new Date();

    if (!prestadorId || !clienteId) {
      return res.status(400).json({ message: "O prestador é obrigatorio" });
    }

    const [prestadoresEncontrados] = await pool.query(
      `SELECT usuario_id FROM prestadores WHERE id = ?`,
      [prestadorId],
    );

    if (prestadoresEncontrados.length === 0) {
      return res
        .status(404)
        .json({ message: "Prestador não encontrado ou inativo" });
    }

    const prestador_id = prestadoresEncontrados[0].usuario_id;

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
      "INSERT INTO solicitacoes (cliente_id,prestador_id,descricao,status,criado_em) VALUES (?,?,?,'pendente',?)",
      [clienteId, prestadorId, descricao, tempoAtual],
    );

    const novaSolicitacaoID = resultado.insertId;

    const novaSolicitacao = {
      id: novaSolicitacaoID,
      clienteId: clienteId,
      nome_cliente: req.user.name,
      status: "pendente",
      criado_em: new Date(),
    };

    if (io && prestadorId) {
      io.to(`usuario_${prestador_id}`).emit(
        "nova_solicitacao",
        novaSolicitacao,
      );
    }
    return res.status(201).json({
      mensagem: "Solicitação enviada com sucesso",
      id: novaSolicitacaoID,
      solicitacao: novaSolicitacao,
    });
  } catch (error) {
    console.error("Erro interno:", error);
    res.status(500).json({ message: "Erro ao Criar Solicitação" });
  }
}

async function listarSolicitacoesDoCliente(req, res) {
  try {
    const clienteId = req.user.id;

    const [solicitacoes] = await pool.query(
      `SELECT solicitacoes.*,
        usuarios.nome AS nome_prestador,
        prestadores.tipo_servico,
        usuarios.telefone FROM solicitacoes
        JOIN prestadores ON solicitacoes.prestador_id = prestadores.id
        JOIN usuarios ON prestadores.usuario_id = usuarios.id
        WHERE solicitacoes.cliente_id = ? AND solicitacoes.visivel_prestador = 1 
        AND solicitacoes.status IN ('pendente','aceita','concluida')
        ORDER BY solicitacoes.criado_em DESC`,
      [clienteId],
    );
    return res.status(200).json(solicitacoes);
  } catch (error) {
    console.error("Erro no Banco ao listar Solicitações:", error);
    return res.status(500).json({ message: "Erro ao Buscar Solicitações" });
  }
}

async function listarSolicitacoesDoPrestador(req, res) {
  try {
    const usuarioId = req.user.id;

    const [Resultadoprestador] = await pool.query(
      "SELECT id FROM prestadores WHERE usuario_id = ?",
      [usuarioId],
    );

    if (Resultadoprestador.length === 0) {
      return res.status(200).json({
        perfilIncompleto: true,
        message: "Aguardando configuração inicial de perfil.",
      });
    }

    const prestador = Resultadoprestador[0];

    const [solicitacoes] = await pool.query(
      `SELECT solicitacoes.*,
              usuarios.nome AS nome_cliente,
              usuarios.email AS email_cliente,
              usuarios.telefone AS cliente_telefone
              FROM solicitacoes JOIN usuarios ON 
              solicitacoes.cliente_id = usuarios.id WHERE
              solicitacoes.prestador_id = ? AND solicitacoes.visivel_prestador = 1
              AND solicitacoes.status IN ('pendente','aceita','concluida') 
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
    const usuarioId = req.user.id;
    const io = req.app.get("io");

    const statusPermitidos = [
      "aceita",
      "recusada",
      "concluida",
      "cancelada",
      "expirado",
    ];

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
      expirado: [],
    };
    const transicoesPermitidas = transicoesValidas[solicitacao.status];

    if (!transicoesPermitidas.includes(novoStatus)) {
      return res.status(422).json({ message: "Transição de status inválida" });
    }

    if (solicitacao.status === "cancelada") {
      return res.status(422).json({
        message: "Solicitação cancelada, não foi possivel aceitar",
      });
    }

    const status_antigo = solicitacao.status.toLowerCase();

    if (novoStatus === "concluida" && status_antigo !== "aceita") {
      return res.status(400).json({
        mensagem: "Apenas solicitações aceitas podem ser concluídas",
      });
    }

    await pool.query(
      `UPDATE solicitacoes 
       SET status = ?
       WHERE id = ? 
    `,
      [novoStatus, solicitacaoId],
    );

    if (novoStatus === "aceita") {
      io.to(`usuario_${solicitacao.cliente_id}`).emit("solicitacao_aceita", {
        solicitacaoId: Number(solicitacaoId),
        novoStatus: "aceita",
        mensagem: "O prestador aceitou a sua solicitação de serviço",
      });
    }

    if (novoStatus === "concluida") {
      io.to(`usuario_${solicitacao.cliente_id}`).emit("solicitacao_concluida", {
        solicitacaoId: Number(solicitacaoId),
        novoStatus: "concluida",
        mensagem: "O prestador concluiu a solicitação",
      });
    }
    return res.status(200).json({
      mensagem: "Status atualizado",
      status: novoStatus,
    });
  } catch (error) {
    console.error("Erro ao executar atualização de status: ", error);
    return res.status(500).json({ message: "Erro ao atualizar status" });
  }
}

async function aceitarSolicitacao(req, res) {
  try {
    const { solicitacaoId } = req.params;
    const prestadorId = req.usuario.id;

    const [rows] = await pool.query(
      `SELECT cliente_id,status, criado_em FROM solicitacoes WHERE id = ?`,
      [solicitacaoId],
    );

    const solicitacao = rows[0];

    if (!solicitacao) {
      return res.status(404).json("Solicitação não encontrada");
    }

    if (solicitacao.status != "pendente") {
      return res
        .status(400)
        .json("Esta solicitação já foi aceita, cancelada ou expirada");
    }

    const agora = new Date();

    const diferenca = agora - new Date(solicitacao.criado_em);
    const minutosDecorridos = Math.floor(diferenca / 60000);

    if (minutosDecorridos >= 1) {
      await atualizarStatus(solicitacaoId, "expirado");
      return res
        .status(400)
        .json("Tempo limite excedido. A solicitação acabou");
    }

    const clienteId = solicitacao.cliente_id;

    await atualizarStatus(solicitacaoId, "aceita", prestadorId);

    if (req.io) {
      req.io.to(`usuario_${clienteId}`).emit("solicitacao_aceita", {
        solicitacaoId: Number(solicitacaoId),
        novoStatus: "aceita",
        mensagem: "O prestador aceitou a sua solicitação de serviço",
      });
    }

    return res.json({ sucesso: true, mensagem: "Solicitação aceita!" });
  } catch (error) {
    console.error("Erro ao aceitar solicitação:", error);
    return res.status(500).json({ erro: "Erro ao aceitar a solicitação" });
  }
}

async function cancelarSolicitacao(req, res) {
  try {
    const solicitacaoId = req.params.id;
    const clienteId = req.usuario.id;

    const [solicitacoes] = await pool.query(
      "SELECT * FROM solicitacoes WHERE id = ?",
      [solicitacaoId],
    );
    if (solicitacoes.length === 0) {
      return res
        .status(404)
        .json({ message: "Solicitação não pode ser encontrada" });
    }

    const solicitacao = solicitacoes[0];

    const estados = ["pendente", "aceita"];

    if (solicitacao.cliente_id !== clienteId) {
      return res.status(403).json({
        message: "Você não tem permissão para cancelar essa solicitação",
      });
    }

    if (!estados.includes(solicitacao.status)) {
      return res
        .status(422)
        .json({ message: "Está solicitação não pode ser cancelada" });
    }

    if (solicitacao.status == "cancelada") {
      return res
        .status(422)
        .json({ message: "Essa solitação já foi cancelada, pelo prestador." });
    }

    await pool.query(
      "UPDATE solicitacoes SET status = 'cancelada', atualizado_em = NOW() WHERE id = ? ",
      [solicitacaoId],
    );

    return res
      .status(200)
      .json({ message: "Solicitação cancelada com sucesso" });
  } catch (error) {
    console.error("ERRO DURANTE PROCESSO DE CANCELAR SOLICITAÇÃO", error);
    return res
      .status(500)
      .json({ message: "Erro interno ao processar o cancelamento" });
  }
}

async function esconderSolicitacao(req, res) {
  const solicitacaoId = req.params.id;
  try {
    const [resultado] = await pool.query(
      "UPDATE solicitacoes SET visivel_prestador = false WHERE id = ?",
      [solicitacaoId],
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ message: "Solicitação não encontrada" });
    }
    return res.status(200).json({ message: "Sucesso: Histórico atualizado" });
  } catch (error) {
    console.error("ERRO CAPTURADO NO CATCH:", error);
    return res.status(500).json({ message: "Erro interno no servidor" });
  }
}

module.exports = {
  criarSolicitacao,
  listarSolicitacoesDoCliente,
  listarSolicitacoesDoPrestador,
  atualizarStatus,
  cancelarSolicitacao,
  esconderSolicitacao,
  aceitarSolicitacao,
};
