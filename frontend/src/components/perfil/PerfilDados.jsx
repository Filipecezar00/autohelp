export function PerfilDados({
  perfil,
  form,
  modoEdicao,
  salvando,
  onEditar,
  onSalvar,
  onCancelar,
  onChange,
}) {
  if (!modoEdicao) {
    return (
      <div className="">
        <p> Nome:{perfil.nome}</p>
        <p> Email: {perfil.email}</p>
        <p>Telefone: {perfil.telefone ?? "Não informado"}</p>
        {perfil.tipo == "prestador" && <p>Descrição: {perfil.descricao}</p>}
        <button onClick={onEditar}>Editar Perfil</button>
      </div>
    );
  }
  if (modoEdicao) {
    return (
      <div>
        <label>
          Nome:{" "}
          <input
            type="text"
            value={form.nome}
            onChange={(e) => onChange("nome", e.target.value)}
          />
        </label>
        <label>
          Email:{" "}
          <input
            type="email"
            value={perfil.email}
            placeholder="o email não pode ser alterado"
            disabled
          />
        </label>
        <label>
          Telefone:{" "}
          <input
            type="tel"
            value={form.telefone}
            onChange={(e) => onChange("telefone", e.target.value)}
          />
        </label>
        {perfil.tipo === "prestador" && (
          <label>
            <textarea
              name="descricao"
              value={form.descricao}
              onChange={(e) => onChange("descricao", e.target.value)}
              maxLength={200}
            ></textarea>
          </label>
        )}
        <div>
          <button onClick={onCancelar} disabled={salvando}>
            Cancelar
          </button>
          <button onClick={onSalvar} disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </div>
    );
  }
}
