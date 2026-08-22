import { Server, Socket } from "socket.io";
import pool from "../config/database";
import type {
  Mensagem,
  StatusSolicitacao,
  EventosServidor,
  EventosCliente,
} from "./tipos";
export function registrarEventosChat(
  io: Server<EventosCliente, EventosServidor>,
) {
  io.on("connection", (socket: Socket<EventosCliente, EventosServidor>) => {
    const usuarioConectado = socket.data.usuario;

    if (usuarioConectado?.id) {
      const salaPessoal = `usuario_${usuarioConectado.id}`;
      socket.join(salaPessoal);
    }

    socket.on("connect_error", (erro: any) => {
      console.log("CONNECT ERROR:", erro.message);
    });

    socket.on("nova_solicitacao", async (dados: any) => {
      try {
        const { prestadorId, tipoServico, descricao } = dados;
        const clientId = socket.id;

        const [solicitacao]: any = await pool.query(
          `INSERT INTO solicitacoes (cliente_id,prestador_id,descricao,status,criado_em) VALUES (?,?,?,'pendente',NOW())  `,
          [clientId, prestadorId, descricao],
        );

        const solicitacaoId: number = solicitacao.insertId;

        const resposta: any = {
          status: "pendente",
          criado_em: new Date(),
          prestadorId: prestadorId,
          tipoServico: tipoServico,
          descricao: descricao,
          clientId: clientId,
          solicitacaoId: solicitacaoId,
        };

        io.to(`usuario_${prestadorId}`).emit("nova_solicitacao_recebida");

        socket.emit("solicitacao_criada_sucesso", resposta);
      } catch (error) {
        console.error("Erro no Socket nova_solicitacao:", error);
        socket.emit("erro", "erro ao processar nova solicitacao");
      }
    });

    socket.on("registrar_usuario", (usuarioId: number) => {
      const sala = `usuario_${usuarioId}`;
      socket.join(sala);
      console.log(`SALA REGISTRADA: ${sala} | socket.id:${socket.id}`);
    });

    socket.on("entrar_sala", async (conversaId: number) => {
      try {
        const [rows]: any = await pool.query(
          "SELECT * FROM conversas WHERE id = ?",
          [conversaId],
        );

        const conversa = rows[0];

        if (!conversa) {
          socket.emit("erro", "Solicitação não encontrada");
          return;
        }

        const ehParticipante =
          Number(conversa.cliente_id) === Number(usuarioConectado.id) ||
          Number(conversa.prestador_id) === Number(usuarioConectado.id);

        if (!ehParticipante) {
          socket.emit("erro", "Acesso negado a esta sala");
          return;
        }

        const nomeDaSala = `conversa_${conversaId}`;
        socket.join(nomeDaSala);
      } catch (error) {
        socket.emit("erro", "Erro ao processar entrada na sala");
      }
    });
    socket.on("enviar_mensagem", async (dados) => {
      const { texto, conversaId } = dados;

      if (!texto || texto.trim().length === 0) {
        socket.emit("erro", "Mensagem não pode ser vazia");
        return;
      }
      if (texto.length > 1000) {
        socket.emit("erro", "Mensagem muito longa");
        return;
      }
      try {
        const [rows]: any = await pool.query(
          `SELECT * FROM conversas WHERE id = ?
          `,
          [conversaId],
        );

        const conversa = rows[0];

        const [resultado]: any = await pool.query(
          `
            INSERT INTO mensagens (conversa_id,remetente_id,texto) VALUES
            (?,?,?)
        `,
          [conversaId, usuarioConectado.id, texto.trim()],
        );

        const idGerado = resultado.insertId;

        const mensagemCompleta: Mensagem = {
          id: idGerado,
          conversaId: conversaId,
          conversa_id: conversaId,
          remetenteId: usuarioConectado.id,
          remetente_id: usuarioConectado.id,
          remetenteNome: usuarioConectado.name || "Usuário",
          texto: texto.trim(),
          criadoEm: new Date().toISOString(),
        };

        const destinatarioId =
          Number(conversa.cliente_id) === Number(usuarioConectado.id)
            ? Number(conversa.prestador_id)
            : Number(conversa.cliente_id);

        io.to(`conversa_${conversaId}`).emit("nova_mensagem", mensagemCompleta);
        io.to(`usuario_${destinatarioId}`).emit("notificacao_mensagem", {
          conversaId: conversaId,
          remetenteNome: usuarioConectado.name || "Alguém",
          texto: texto.trim(),
        });
      } catch {
        socket.emit("erro", "Erro ao salvar mensagem");
      }
    });
    socket.on("sair_sala", (conversaId: number) => {
      const nomeDaSala = `conversa_${conversaId}`;
      socket.leave(nomeDaSala);
    });
    socket.on("disconnect", (motivo) => {
      console.log("DISCONNECT:", motivo);
    });
  });

  function emitirStatusAtualizado(
    io: Server<EventosCliente, EventosServidor>,
    conversaId: number,
    status: StatusSolicitacao,
  ) {
    const nomeDaSala = `conversa_${conversaId}`;
    io.to(nomeDaSala).emit("status_atualizado", { conversaId, status });
  }
}
