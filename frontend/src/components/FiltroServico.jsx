export function FiltroServico({ filtroAtivos, onAlternar }) {
  const tipos = [
    { valor: "mecanico", label: "Mecânico" },
    { valor: "borracheiro", label: "Borracheiro" },
    { valor: "guincho", label: "Guincho" },
  ];

  return (
    <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
      {tipos.map((tipo) => {
        const estaAtivo = filtroAtivos.includes(tipo.valor);
        return (
          <button
            style={{
              backgroundColor: estaAtivo ? "#3b82f6" : "#e5e7eb",
              color: estaAtivo ? "white" : "black",
              padding: "8px 16px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
            onClick={() => onAlternar(tipo.valor)}
            key={tipo.valor}
          >
            <span>{tipo.label}</span>
          </button>
        );
      })}
    </div>
  );
}
