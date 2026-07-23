import { Server, Socket } from "socket.io";
import pool from "../config/database";
import {
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

    socket.on("entrar_sala", async (conversaId: number) => {
      try {
        const [rows]: any = await pool.query(
          "SELECT * FROM solicitacoes WHERE id = ?",
          [conversaId],
        );

        const solicitacao = rows[0];

        if (!solicitacao) {
          socket.emit("erro", "Solicitação não encontrada");
          return;
        }

        const ehParticipante =
          solicitacao.cliente_id === usuarioConectado.id ||
          solicitacao.prestador_usuario_id === usuarioConectado.id;

        if (!ehParticipante) {
          socket.emit("erro", "Acesso negado a esta sala");
          return;
        }
        const nomeDaSala = `conversa_${conversaId}`;
        socket.join(nomeDaSala);
        console.log(
          `Usuário ${usuarioConectado.id} entrou na sala: ${nomeDaSala}`,
        );
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
        const [resultado]: any = await pool.query(
          `
            INSERT INTO mensagens (solicitacao_id,remetente_id,texto) VALUES
            (?,?,?)
        `,
          [conversaId, usuarioConectado.id, texto.trim()],
        );
        const idGerado = resultado.insertId;

        const mensagemCompleta: Mensagem = {
          id: idGerado,
          conversaId: conversaId,
          remetenteId: usuarioConectado.id,
          remetenteNome: usuarioConectado.nome || "Usuário",
          texto: texto.trim(),
          criadoEm: new Date().toISOString(),
        };
        const nomeDaSala = `conversa_${conversaId}`;
        io.to(nomeDaSala).emit("nova_mensagem", mensagemCompleta);
      } catch {
        socket.emit("erro", "Erro ao salvar mensagem");
      }
    });
    socket.on("sair_sala", (conversaId: number) => {
      const nomeDaSala = `conversa_${conversaId}`;
      socket.leave(nomeDaSala);
    });
    socket.on("disconnect", () => {
      console.log(
        `Usuário ${usuarioConectado?.id || "Desconhecido"} desconectou do WebSocket`,
      );
    });
  });
  function emitirStatusAtualizado(
    io: Server<EventosCliente, EventosServidor>,
    conversaId: number,
    status: StatusSolicitacao,
  ) {
    const nomeDaSala = `Conversa_${conversaId}`;
    io.to(nomeDaSala).emit("status_atualizado", { conversaId, status });
  }
}
