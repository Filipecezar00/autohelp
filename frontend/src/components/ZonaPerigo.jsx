import { useState } from "react";

export function ZonaPerigo({ aberta, onToggle, onConfirmar }) {
  const [senha, setSenha] = useState("");
  const [deletando, setDeletando] = useState(false);
  const [erro, setErro] = useState(null);

  async function handleDeletar() {
    if (senha.length === 0) {
      setErro("Digite sua senha para confirmar");
      return;
    }
    try {
      setDeletando(true);
      setErro(null);
      await onConfirmar(senha);
    } catch (erro) {
      setErro("Senha incorreta ou erro ao deletar conta");
      setDeletando(false);
    }

    return (
      <div>
        <button onClick={onToggle}>Excluir conta</button>
        {aberta && (
          <div>
            <p>
              Esta ação é permanente e não pode ser desfeita, todos os seus
              dados serão removidos.
            </p>
          </div>
        )}
        <label>
          <input
            type="password"
            placeholder="Digite sua senha para confirmar"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </label>

        {erro && <p>Erro durante o processo: {erro}</p>}
        <div>
          <button onClick={onToggle} disabled={deletando}>
            Cancelar
          </button>
          <button
            disabled={deletando || senha.length === 0}
            onClick={handleDeletar}
          >
            {deletando ? "Excluindo" : "Excluir minha conta"}
          </button>
        </div>
      </div>
    );
  }
}
