import { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { useChat } from "../hooks/useChat";
import TelaCarregando from "../components/TelaCarregando";
import { BolhaMensagem } from "../components/chat/BolhaMensagem";
import { InputMensagem } from "../components/chat/InputMensagem";
import styles from "../../src/Chat.module.css";

export function Chat() {
  const { conversaId } = useParams<{ conversaId: string }>();
  const usuarioid = useContext(AuthContext);
  const { usuario } = usuarioid;

  const { Mensagens, Conectado, Carregando, erro, enviarMensagem } = useChat(
    Number(conversaId),
  );

  const refFinal = useRef<HTMLDivElement>(null);

  useEffect(() => {
    refFinal.current?.scrollIntoView({ behavior: "smooth" });
  }, [Mensagens]);

  if (Carregando) {
    return <TelaCarregando mensagem={"carregando"} />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.cabecalho}>
        <h1 className={styles.title}>Chat Solicitação - {conversaId}</h1>
        <span className={styles.badge}>
          {Conectado ? "Conectado" : "Reconectando..."}
        </span>
      </div>
      {Mensagens.length === 0 ? (
        <p className={styles.advice}>Nenhuma mensagem ainda, mande um Oi!</p>
      ) : (
        Mensagens.map((msg) => (
          <BolhaMensagem
            key={msg.id}
            mensagem={msg}
            ehMinha={msg.remetenteId ?? msg.remetente_id == usuario.id}
          />
        ))
      )}
      <div ref={refFinal} />

      {erro && <div>{erro}</div>}
      <InputMensagem onEnviar={enviarMensagem} conectado={Conectado} />
    </div>
  );
}
