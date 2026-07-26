import { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { useChat } from "../hooks/useChat";
import TelaCarregando from "../components/TelaCarregando";
import { BolhaMensagem } from "../components/chat/BolhaMensagem";
import { InputMensagem } from "../components/chat/InputMensagem";

export function Chat() {
  const { conversaId } = useParams<{ conversaId: string }>();
  const usuarioid = useContext(AuthContext);

  const { Mensagens, Conectado, Carregando, erro, enviarMensagem } = useChat(
    Number(conversaId),
  );

  const [texto, setTexto] = useState<string>("");
  const refFinal = useRef<HTMLDivElement>(null);

  useEffect(() => {
    refFinal.current?.scrollIntoView({ behavior: "smooth" });
  }, [Mensagens]);

  if (Carregando) {
    return <TelaCarregando mensagem={"carregando"} />;
  }

  function handleEnviar() {
    if (texto.trim().length > 0) {
      enviarMensagem(texto);
      setTexto("");
    }
  }
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100%",
        backgroundColor: "#121214",
        color: "#ffffff",
        padding: "20px",
      }}
    >
      <div>
        <h1>Chat Solicitação - {conversaId}</h1>
        <span>{Conectado ? "Conectado" : "Reconectando..."}</span>
      </div>
      {Mensagens.length === 0 ? (
        <p>Nenhuma mensagem ainda, mande um Oi!</p>
      ) : (
        Mensagens.map((msg) => (
          <BolhaMensagem
            key={msg.id}
            mensagem={msg}
            ehMinha={msg.remetenteId === usuarioid}
          />
        ))
      )}
      <div ref={refFinal} />

      {erro && <div>{erro}</div>}
      <InputMensagem onEnviar={handleEnviar} conectado={Conectado} />
    </div>
  );
}
