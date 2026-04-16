import { useState, useEffect } from "react";
import api from "../services/api";
import PrestadorCard from "../components/PrestadorCard";

function Home() {
  const [prestadores, setPrestadores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    buscarPrestadores();
  }, []);

  const buscarPrestadores = async () => {
    try {
      setCarregando(true);
      setErro(null);

      const resposta = await api.get("/prestadores");
      setPrestadores(resposta.data);
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
      <h1 style={styles.titulo}>Mecânico Perto</h1>
      <p style={styles.subtitulo}>{prestadores.length} prestador encontrado</p>
      {prestadores.map((prestador) => (
        <PrestadorCard key={prestadores.id} prestador={prestador} />
      ))}
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
