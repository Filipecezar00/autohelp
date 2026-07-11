import { useNavigate } from "react-router-dom";

function PrestadorCard({ prestador, usuario }) {
  const tipoInfo = {
    mecanico: { label: "Mêcanico", cor: "#1a73e8" },
    borracheiro: { label: "Borracheiro", cor: "#e67e00" },
    guincho: { label: "Guincho", cor: "#c0392b" },
  };
  const info = tipoInfo[prestador.tipo_servico] || {
    label: prestador.tipo_servico,
    cor: "#555",
  };

  const navigate = useNavigate();
  const usuarioLogadoId = usuario.id;

  const solicitarServico = () => {
    console.log("DEBUG CARD PRESTADOR", {
      ID_Logado: usuarioLogadoId,
      Tipo_Id_Logado: typeof usuarioLogadoId,
      Objeto_Prestador_Inteiro: prestador,
      Usuario_Id_No_Prestador: prestador?.usuario_id,
    });
    if (prestador?.id) {
      navigate(`/solicitar/${prestador.id}`, {
        state: {
          nome: prestador.nome,
          distancia: prestador.distancia,
        },
      });
    } else {
      navigate("/mapa");
    }
  };
  return (
    <div style={styles.card}>
      <div style={{ ...styles.badge, backgroundColor: info.cor }}>
        {info.label}
      </div>

      <h3 style={styles.nome}>
        {prestador.descricao || "Prestadores de Serviço"}
      </h3>

      <p style={styles.info}>
        {prestador.telefone || "Telefone não informado"}
      </p>
      <p style={styles.info}>
        Lat:{prestador.latitude},Lng:{prestador.longitude}
      </p>

      {prestador?.usuario_id !== usuarioLogadoId ? (
        <button style={styles.botao} onClick={solicitarServico}>
          Solicitar Serviço
        </button>
      ) : (
        <span style={{}}>Este é o seu Perfil</span>
      )}
    </div>
  );
}
const styles = {
  card: {
    border: "1px solid #ddd",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "12px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
  },
  badge: {
    display: "inline-block",
    color: "#fff",
    fontSize: "12px",
    fontWeight: "600",
    padding: "4px 10px",
    borderRadius: "20px",
    marginBottom: "10px",
  },
  nome: {
    margin: "0 0 8px",
    fontSize: "16px",
    color: "#222",
  },
  info: {
    margin: "4px 0",
    fontSize: "13px",
    color: "#555",
  },
  botao: {
    marginTop: "12px",
    width: "100%",
    padding: "10px",
    backgroundColor: "#1a73e8",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    cursor: "pointer",
  },
};
export default PrestadorCard;
