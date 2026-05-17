import React, { useState, useEffect } from "react";
import api from "../services/api";
import MapaView from "../components/MapaView";
import useGeolocalizacao from "../hooks/useGeolocalizacao";

export default function Mapa() {
  const {
    latitude,
    longitude,
    erro: erroGeo,
    carregando: buscandoGeo,
  } = useGeolocalizacao();
  const [prestadores, setPrestadores] = useState([]);
  const [carregandoAPI, setCarregandoAPI] = useState(true);
  const [erroAPI, setErroAPI] = useState(null);
  const [filtrosTipos, setFiltrosTipos] = useState([
    "mecanico",
    "borrachoeiro",
    "guincho",
  ]);
  const [raio, setRaio] = useState(10);

  const centroLat = latitude || -12.962682;
  const centroLng = longitude || -38.402214;

  async function buscarPrestadores() {
    try {
      setCarregandoAPI(true);
      setErroAPI(null);
      const resposta = await api.get("/prestadores/proximos", {
        params: { lat: centroLat, lng: centroLng, raio: raio },
      });

      console.log("RAIO-X DO MAPA");
      console.log("STATUS DA RESPOSTA:", resposta.status);
      console.log(
        "QUANTIDADE DE PRESTADORES RECEBIDOS DENTRO DO RAIO:",
        resposta.data.length,
      );
      console.log("DADOS RECEBIDOS BRUTAS:", resposta.data);

      setPrestadores(resposta.data);
    } catch (error) {
      console.error("Erro ao carregar dados no mapa", error);
      setErroAPI("Não foi possível carregar os prestadores próximos.");
    } finally {
      setCarregandoAPI(false);
    }
  }

  useEffect(() => {
    if (centroLat && centroLng) {
      buscarPrestadores();
    }
  }, [centroLat, centroLng, raio]);

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
        Erro de localização: {erroGeo}{" "}
        <button onClick={() => window.location.reload()}>
          Tentar novamente
        </button>
      </div>
    );

  if (carregandoAPI)
    return <div>Carregando Prestadores próximos no mapa...</div>;

  return (
    <MapaView
      prestadores={prestadoresFiltrados}
      centro={[centroLat, centroLng]}
      alternarFiltro={alternarFiltro}
      filtrosAtivos={filtrosTipos}
    />
  );
}
