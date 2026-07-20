import { Request, Response } from "express";
import pool = require("../config/database");

async function buscarOuCriarConversa(req: Request, res: Response) {
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

    const resultado: any = await pool.query(
      `INSERT INTO ? conversas (cliente_id, prestador_id) VALUES (?,?)`,
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
