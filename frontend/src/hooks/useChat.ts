import { Mensagem } from "../types/chat.types";
import { useState, useEffect } from "react";
import socket from "../services/socket";
import api from "../services/api";

export function useChat(solicitacaoId: number) {
  const [Mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [Conectado, setConectado] = useState<boolean>(false);
  const [Carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function handleSocket() {
      socket.connect();
      socket.emit("entrar_sala", solicitacaoId);

      socket.on("nova_mensagem", (mensagem: Mensagem) => {
        setMensagens((prev: any) => [...prev, mensagem]);
      });

      socket.on("connect", () => setConectado(true));

      socket.on("status_atualizado", (dados) => {});

      socket.on("erro", (mensagemErro: string) => {
        setErro(mensagemErro);
      });

      socket.on("disconnect", () => setConectado(false));

      try {
        const resposta = await api.get<Mensagem[]>(
          `/mensagens/${solicitacaoId}`,
        );
        setMensagens(resposta.data);
      } catch {
        setCarregando(false);
        setErro("Erro durante o processo.");
      }
    }
    handleSocket();

    function limpezaFunção() {
      socket.emit("sair_sala", solicitacaoId);
      socket.off("connect");
      socket.off("disconnect");
      socket.off("nova_mensagem");
      socket.off("status_atualizado");
      socket.off("erro");
      socket.disconnect();
    }

    return limpezaFunção;
  }, [solicitacaoId]);

  function enviarMensagem(texto: string): void {
    if (texto.trim().length === 0) return;
    if (Conectado === false) return;

    socket.emit("enviar_mensagem", {
      texto: texto.trim(),
      solicitacaoId,
    });
  }
  return { Mensagens, Conectado, Carregando, erro, enviarMensagem };
}
