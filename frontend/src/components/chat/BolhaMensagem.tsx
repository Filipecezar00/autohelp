import { Mensagem } from "../../types/chat.types";

interface Props {
  mensagem: Mensagem;
  ehMinha: boolean;
}

export function BolhaMensagem({ mensagem, ehMinha }: Props) {
  const formatarHorario = (dataIso: string) => {
    try {
      const data = new Date(dataIso);
      return data.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className={ehMinha ? "direita" : "esquerda"}>
      {!ehMinha && <span>{mensagem.remetenteNome}</span>}
      <div className={ehMinha ? "bolha-minha" : "bolha-outra"}>
        <p>{mensagem.texto}</p>
        <span>Horário:{formatarHorario(mensagem.criadoEm)}</span>
      </div>
    </div>
  );
}
