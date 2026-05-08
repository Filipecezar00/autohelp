import { useState, useEffect } from "react";
import api from "../services/api";
import useGeolocalizacao from "../hooks/useGeolocalizacao";

export default function Mapa() {
  const {
    latitude,
    longitude,
    erro: erroGeo,
    carregando: buscandoGeo,
  } = useGeolocalizacao();
  const [prestadores, setPrestadores] = useState([]);
  const [carregandoAPI, setCarregandoAPI] = useState(false);
  const [erroAPI, setErroAPI] = useState(null);
  const [filtrosTipos, setFiltrosTipos] = useState([
    "mecanico",
    "borracheiro",
    "guincho",
  ]);
  const [raio, setRaio] = useState(10);

  async function buscarPrestadores() {
    try {
      setCarregandoAPI(true);
      setErroAPI(null);
      const resposta = await api.get("/prestadores/proximos", {
        params: { lat: latitude, lng: longitude, raio: raio },
      });
      setPrestadores(resposta.data);
    } catch (error) {
      setErroAPI("Não foi possível carregar os prestadores");
    } finally {
      setCarregandoAPI(false);
    }
  }

  useEffect(() => {
    if (latitude && longitude) {
      buscarPrestadores();
    }
  }, [latitude, longitude, raio]);

  const prestadoresFiltrados = prestadores.filter((p) =>
    filtrosTipos.includes(p.tipo_servico),
  );

  function alternarFiltro(tipo) {
    if (filtrosTipos.includes(tipo)) {
      if (filtrosTipos.length > 1) {
        setFiltrosTipos(filtrosTipos.filter((t) => t !== tipo));
      }
    } else {
      setFiltrosTipos([...filtrosTipos, tipo]);
    }
  }

  if (buscandoGeo) return <div>Obtendo sua localização...</div>;
  if (erroGeo)
    return (
      <div>
        Erro: {erroGeo}{" "}
        <button onClick={() => window.location.reload()}>
          Tentar novamente
        </button>
      </div>
    );
}
