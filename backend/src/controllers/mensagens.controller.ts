import { pool } from "../config/database";
import { Request, Response } from "express";

export async function buscarMensagens(req: Request, res: Response) {
  try {
    const { prestadorId } = req.params;
    const usuarioId = (req as any).user?.id;

    const querySQL = `
    SELECT * FROM mensagens WHERE (remetente_id = ? AND destinatario_id = ?)
     OR (remetente_id = ? AND destinatario_id = ?) ORDER BY criado_em ASC
    `;
    if (!usuarioId) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const [mensagens]: any = await pool
      .promise()
      .execute(querySQL, [prestadorId, usuarioId, usuarioId, prestadorId]);
    const mensagem = mensagens[0];

    if (!mensagem) {
      return res.status(404).json({ message: "Solicitação não encontrada" });
    }

    return res.status(200).json(mensagens);
  } catch (error) {
    console.error("Erro ao buscar histórico de mensagens:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}
