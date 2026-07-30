import { useState, KeyboardEvent } from "react";
import styles from "../../../src/Chat.module.css";

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
    <div className={styles.containerInput}>
      <input
        type="text"
        placeholder={conectado ? "Digite sua mensagem..." : "Conectando..."}
        value={texto}
        onKeyDown={handleKeyDown}
        onChange={(e) => setTexto(e.target.value)}
        disabled={!conectado}
        className={styles.input}
      />
      <button
        onClick={handleEnviar}
        disabled={!conectado || texto.trim().length === 0}
        className={styles.btn_enviar}
      >
        Enviar
      </button>
      {erro && <span>{erro}</span>}
    </div>
  );
}
