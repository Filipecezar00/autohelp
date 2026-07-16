import { useState, KeyboardEvent } from "react";

interface InputMensagemProps {
  onEnviar: (texto: string) => void;
  conectado: boolean;
}

export function InputMensagem({ onEnviar, conectado }: InputMensagemProps) {
  const [texto, setTexto] = useState<string>("");
  const [erro, setErro] = useState<string>("");

  const handleEnviar = () => {
    if (texto.trim().length == 0) {
      setErro("Digite algo para enviar a mensagem");
      return;
    }

    onEnviar(texto.trim());

    setTexto("");
    setErro("");
  };
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key == "Enter") {
      handleEnviar();
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder={conectado ? "Digite sua mensagem..." : "Conectando..."}
        value={texto}
        onKeyDown={handleKeyDown}
        onChange={(e) => setTexto(e.target.value)}
        disabled={!conectado}
      />
      <button
        onClick={handleEnviar}
        disabled={!conectado || texto.trim().length === 0}
      >
        Enviar
      </button>
      {erro && <span>{erro}</span>}
    </div>
  );
}
