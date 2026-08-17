import { Mensagem } from "../../types/chat.types";
import "../../../src/bolhaMensagem.css";
import { AuthContext } from "../../contexts/AuthContext";
import { useContext } from "react";

interface Props {
  mensagem: Mensagem;
  ehMinha: boolean;
}

export function BolhaMensagem({ mensagem, ehMinha }: Props) {
  const usuarioid = useContext(AuthContext);
  const { usuario } = usuarioid;

  const formatarHorario = (dataIso: string) => {
    if (!dataIso) return "";
    try {
      const data = new Date(dataIso);
      if (isNaN(data.getTime())) return "";
      return data.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className={`mensagem-container ${ehMinha ? "minha" : "outra"}`}>
      {!ehMinha && (
        <span className="nome-remetente">{mensagem.remetente_nome}</span>
      )}
      <div className={`bolha ${ehMinha ? "bolha-minha" : "bolha-outra"}`}>
        <p className="texto-mensagem">{mensagem.texto}</p>
        <span className="horario">
          Horário:{formatarHorario(mensagem.criadoEm ?? mensagem.criado_em)}
        </span>
      </div>
    </div>
  );
}
