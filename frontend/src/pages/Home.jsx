import { useState, useEffect } from "react";
import api from "../services/api";
import PrestadorCard from "../components/PrestadorCard";
import { useNavigate } from "react-router-dom";

function Home() {
  const [prestadores, setPrestadores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    buscarPrestadores();
  }, []);

  const buscarPrestadores = async () => {
    try {
      setCarregando(true);
      setErro(null);

      const resposta = await api.get("/prestadores");
      if (resposta && resposta.data) {
        setPrestadores(resposta.data);
      }
    } catch (error) {
      setErro(
        "Não foi possivel carregar os prestadores. Verifique se o servidor está no ar",
      );
      console.error("Erro ao buscar prestadores:", error);
    } finally {
      setCarregando(false);
    }
  };
  if (carregando) {
    return <p style={styles.mensagem}>Buscando Prestadores Próximos...</p>;
  }
  if (erro) {
    return (
      <div style={styles.erro}>
        <p>{erro}</p>
        <button onClick={buscarPrestadores} style={styles.botaoTentar}>
          Tentar novamente
        </button>
      </div>
    );
  }
  return (
    <div style={styles.container}>
      <h1 style={styles.titulo}>AutoHelp</h1>
      <p style={styles.subtitulo}>
        {prestadores.length} prestadores encontrados
      </p>
      {prestadores.map((prestador) => (
        <PrestadorCard key={prestadores.id} prestador={prestador} />
      ))}
      <div className={styles.containerBtn}>
        <button onClick={() => navigate("/mapa")} style={styles.btnMapa}>
          Ver Mapa de Prestadores
        </button>
      </div>
    </div>
  );
}
const styles = {
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "sans-serif",
  },
  btnMapa: {
    marginTop: "20px",
    padding: "14px 28px",
    background: "#1a4fa8",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    cursor: "pointer",
  },
  containerBtn: {
    padding: "24px",
    fontFamily: "sans-serif",
  },
  titulo: {
    fontSize: "24px",
    margimBottom: "4px",
  },
  subtitulo: {
    color: "#666",
    fontSize: "14px",
    marginBottom: "20px",
  },
  mensagem: {
    textAlign: "center",
    margimBottom: "40px",
    color: "#555",
    fontFamily: "sans-serif",
  },
  erro: {
    textAlign: "center",
    marginTop: "40px",
    color: "#c0392b",
    fontFamily: "sans-serif",
  },
  botaoTentar: {
    marginTop: "12px",
    padding: "8px 20px",
    backgroundColor: "#1a73e8",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};
export default Home;
