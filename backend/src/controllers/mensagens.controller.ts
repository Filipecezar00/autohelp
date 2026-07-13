import { pool } from "../config/database";
import { Request, Response } from "express";

export async function buscarMensagens(req: Request, res: Response) {
  try {
    const solicitacaoId = Number(req.params.solicitacaoId);
    const usuarioId = (req as any).user?.id;

    if (!usuarioId) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const [solicitacoes]: any = await pool.query(
      `SELECT solicitacoes.*,prestadores.usuario_id
   AS prestador_usuario_id FROM solicitacoes JOIN prestadores
   ON solicitacoes.prestador_id = prestadores.id
   WHERE solicitacoes.id = ?`,
      [solicitacaoId],
    );
    const solicitacao = solicitacoes[0];

    if (!solicitacao) {
      return res.status(404).json({ message: "Solicitação não encontrada" });
    }
    const ehParticipante =
      solicitacao.cliente_id === usuarioId ||
      solicitacao.prestador_usuario_id === usuarioId;

    if (!ehParticipante) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    const [mensagensRows]: any = await (pool.query(
      `SELECT mensagens.id,mensagens.texto,mensagens.criado_em,mensagens.remetente_id,usuarios.nome
     AS remetente_nome FROM mensagens JOIN usuarios ON mensagens.remetente_id = usuarios.id
     WHERE mensagens.solicitacao_id = ?, ORDER BY mensagens.criado_em ASC LIMIT 100
     `,
      [solicitacaoId],
    ) as any);
    return res.status(200).json({ mensagens: mensagensRows });
  } catch (error) {
    console.error("Erro ao buscar histórico de mensagens:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}
