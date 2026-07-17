import { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { useChat } from "../hooks/useChat";
import TelaCarregando from "../components/TelaCarregando";
import { BolhaMensagem } from "../components/chat/BolhaMensagem";
import { InputMensagem } from "../components/chat/InputMensagem";

export function Chat() {
  const { solicitacaoId } = useParams<{ solicitacaoId: string }>();
  const { usuario } = useContext(AuthContext);

  const { Mensagens, Conectado, Carregando, erro, enviarMensagem } = useChat(
    Number(solicitacaoId),
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
    if (texto.trim().length >= 0) {
      enviarMensagem(texto);
      setTexto("");
    }

    console.log("Caminho atual da URL (pathname):", window.location.pathname);

    const params = useParams();
    console.log("Parâmetros lidos pelo react router:", params);

    return (
      <div>
        <div>
          <h1>Chat Solicitação - {solicitacaoId}</h1>
          <span>{Conectado ? "Conectado" : "Reconectando..."}</span>
        </div>
        {erro && <div>{erro}</div>}
        <div>
          {Mensagens.map((Mensagem) => (
            <BolhaMensagem
              key={Mensagem.id}
              mensagem={Mensagem}
              ehMinha={Mensagem.remetenteId === usuario?.id}
            />
          ))}
          <div ref={refFinal} />
        </div>
        <InputMensagem onEnviar={handleEnviar} conectado={Conectado} />
      </div>
    );
  }
}
