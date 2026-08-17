import { Mensagem } from "../types/chat.types";
import { useState, useEffect } from "react";
import socket from "../services/socket";
import api from "../services/api";

export function useChat(conversaId: number) {
  const [Mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [Conectado, setConectado] = useState<boolean>(false);
  const [Carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function handleSocket() {
      setMensagens([]);
      setCarregando(true);
      if (socket.connected == true) {
        setConectado(true);
        socket.emit("entrar_sala", conversaId);
      }

      socket.on("nova_mensagem", (mensagem: Mensagem) => {
        setMensagens((prev: any) => [...prev, mensagem]);
      });

      socket.on("connect", () => {
        setConectado(true);
        socket.emit("entrar_sala", conversaId);
      });

      socket.on("status_atualizado", (dados) => {});

      socket.on("erro", (mensagemErro: string) => {
        setErro(mensagemErro);
      });

      socket.on("disconnect", () => setConectado(false));

      socket.auth = { token: localStorage.getItem("token") };
      socket.connect();
      try {
        const resposta = await api.get<Mensagem[]>(
          `/conversas/${conversaId}/mensagens`,
        );
        setMensagens(resposta.data);
      } catch (error) {
        console.error("ERRO AO CARREGAR MENSAGENS NO REACT:", error);
        setErro("Erro durante o processo.");
      } finally {
        setCarregando(false);
      }
    }
    handleSocket();

    function limpezaFunção() {
      socket.emit("sair_sala", conversaId);
      socket.off("connect");
      socket.off("disconnect");
      socket.off("nova_mensagem");
      socket.off("status_atualizado");
      socket.off("erro");
    }

    return limpezaFunção;
  }, [conversaId]);

  function enviarMensagem(texto: string): void {
    if (texto.trim().length === 0) {
      return;
    }
    if (Conectado === false) {
      return;
    }

    socket.emit("enviar_mensagem", {
      texto: texto.trim(),
      conversaId,
    });
  }
  return { Mensagens, Conectado, Carregando, erro, enviarMensagem };
}
