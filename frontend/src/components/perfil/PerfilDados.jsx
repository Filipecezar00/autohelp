import styles from "../../../src/Perfil.module.css";
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
      <div className={styles.informacoes}>
        <p> Nome:{perfil.nome}</p>
        <p> Email: {perfil.email}</p>
        <p>Telefone: {perfil.telefone ?? "Não informado"}</p>
        {perfil.tipo == "prestador" && <p>Descrição: {perfil.descricao}</p>}
        <button onClick={onEditar} className={styles.btns_header}>
          Editar Perfil
        </button>
      </div>
    );
  }
  if (modoEdicao) {
    return (
      <div className={style.containerBody}>
        <label className={styles.labels}>
          Nome:
          <input
            type="text"
            value={form.nome}
            onChange={(e) => onChange("nome", e.target.value)}
            className={styles.inputs}
          />
        </label>
        <label className={styles.labels}>
          Email:{" "}
          <input
            type="email"
            value={perfil.email}
            placeholder="o email não pode ser alterado"
            className={styles.inputs}
            disabled
          />
        </label>
        <label className={styles.labels}>
          Telefone:{" "}
          <input
            type="tel"
            value={form.telefone}
            onChange={(e) => onChange("telefone", e.target.value)}
            className={styles.inputs}
          />
        </label>
        {perfil.tipo === "prestador" && (
          <label className={styles.labels}>
            <textarea
              name="descricao"
              value={form.descricao}
              onChange={(e) => onChange("descricao", e.target.value)}
              maxLength={200}
              className={styles.inputs}
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
