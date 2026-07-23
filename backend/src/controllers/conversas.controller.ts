import { Request, Response } from "express";
import pool = require("../config/database");

export async function buscarOuCriarConversa(req: Request, res: Response) {
  try {
    const clienteId = (req as any).user?.id;
    const PrestadorId = Number((req as any).body.prestador_id);

    if (!PrestadorId) {
      return res.status(400).json({ message: "Prestador_id é obrigatório" });
    }

    const [prestadores]: any = await pool.query(
      `SELECT usuario_id FROM prestadores WHERE usuario_id = ? AND ativo = true`,
      [PrestadorId],
    );

    const prestador = prestadores[0];

    if (!prestador) {
      return res.status(404).json({ message: "Prestador não encontrado" });
    }

    if (clienteId === PrestadorId) {
      return res.status(400).json({ message: "Operação inválida" });
    }

    const [conversas]: any = await pool.query(
      `SELECT * FROM conversas WHERE cliente_id = ? AND prestador_id = ?`,
      [clienteId, PrestadorId],
    );

    const conversa = conversas[0];

    if (conversa) {
      return res
        .status(200)
        .json({ conversa_id: (conversa as any).id, nova: false });
    }

    const [resultado]: any = await pool.query(
      `INSERT INTO conversas (cliente_id, prestador_id) VALUES (?,?)`,
      [clienteId, PrestadorId],
    );

    return res
      .status(201)
      .json({ conversa_id: resultado.insertId, nova: true });
  } catch (error) {
    console.error("Erro ao buscar ou Criar conversa.", error);
    res.status(500).json({ message: "Erro ao buscar ou criar conversa." });
  }
}
export async function buscarMensagens(req: Request, res: Response) {
  try {
    const conversaId = Number((req as any).params.id);
    const usuarioId = (req as any).user.id;

    if (!conversaId || isNaN(conversaId)) {
      return res.status(400).json({ message: "ID de conversa inválido" });
    }

    const [conversas]: any = await pool.query(
      `SELECT * FROM conversas WHERE id = ?`,
      [conversaId],
    );

    const conversa = conversas[0];

    if (!conversa) {
      return res.status(404).json({ message: "Conversa não encontrada" });
    }

    const ehParticipante =
      conversa.cliente_id === usuarioId || conversa.prestador_id === usuarioId;

    if (!ehParticipante) {
      return res.status(403).json({ message: "Acesso Negado!" });
    }

    const [mensagens]: any = await pool.query(
      `SELECT mensagens.id,mensagens.texto,mensagens.criado_em,mensagens.remetente_id,usuarios.nome 
       AS remetente_nome FROM mensagens JOIN usuarios ON
       mensagens.remetente_id = usuarios.id WHERE mensagens.conversa_id = ?
       ORDER BY mensagens.criado_em ASC LIMIT 100`,
      [conversaId],
    );

    const mensagem = mensagens[0];

    return res.status(200).json(mensagem);
  } catch (error) {
    console.error("Erro ao realizar busca por mensagens", error);
    res
      .status(500)
      .json({ message: "Erro ao realizar a busca por mensagens!" });
  }
}
