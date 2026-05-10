import { CiPhone } from "react-icons/ci";

export function CardPrestador({ prestador }) {
  const labelTipo = {
    mecanico: "Mecânico",
    borracheiro: "Borracheiro",
    guincho: "Guincho",
  };

  return (
    <div
      style={{ border: "1px solid #ccc", padding: "15px", borderRadius: "8px" }}
    >
      <span
        style={{
          backgroundColor: "e5e7eb",
          padding: "4px 8px",
          borderRadius: "4px",
          fontSize: "12px",
        }}
      >
        {labelTipo[prestador.tipo_servico]}
      </span>

      <h2>{prestador.nome}</h2>

      {prestador.descricao && (
        <p style={{ color: "#666", fontSize: "14px" }}>{prestador.descricao}</p>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          margin: "10px 0",
        }}
      >
        <CiPhone size={20} />
        <a
          href={`tel:${prestador.telefone}`}
          style={{ textDecoration: "none", color: "#3b82f6" }}
        >
          {prestador.telefone}
        </a>
      </div>

      <p>
        <strong>{prestador.distancia_km} km</strong> de distância
      </p>

      <button
        disabled
        title="Em breve"
        style={{ width: "100%", padding: "10px", cursor: "not-allowed" }}
      >
        Solicitar Serviço
      </button>
    </div>
  );
}
