import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import MapaView from "../components/MapaView";
import FiltroServico from "../components/FiltroServico";
import TelaCarregando from "../components/TelaCarregando";
import TelaErro from "../components/TelaErro";
import useGeolocalizacao from "../hooks/useGeolocalizacao";

const COORDENADAS_PADRAO = {
  lat: -12.962682,
  lng: -38.402214,
};

const TIPOS_SERVICO = ["mecanico", "borracheiro", "guincho"];

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
  const [filtrosTipos, setFiltrosTipos] = useState(TIPOS_SERVICO);

  const [raio, setRaio] = useState(10);

  const centroLat = latitude ?? COORDENADAS_PADRAO.lat;
  const centroLng = longitude ?? COORDENADAS_PADRAO.lng;

  const buscarPrestadores = useCallback(async () => {
    try {
      setCarregandoAPI(true);
      setErroAPI(null);

      const resposta = await api.get("/prestadores/proximos", {
        params: { lat: centroLat, lng: centroLng, raio },
      });

      setPrestadores(resposta.data);
    } catch (erro) {
      setErroAPI("Não foi possivel carregar os prestadores próximos");
    } finally {
      setCarregandoAPI(false);
    }
  }, [centroLat, centroLng, raio]);

  useEffect(() => {
    buscarPrestadores();
  }, [buscarPrestadores]);

  const prestadoresFiltrados = prestadores.filter((p) =>
    filtrosTipos.includes(p.tipo_servico),
  );

  const alternarFiltro = useCallback((tipo) => {
    setFiltrosTipos((filtrosAtuais) => {
      const jaAtivo = filtrosAtuais.includes(tipo);

      if (jaAtivo && filtrosAtuais.length === 1) return filtrosAtuais;

      return jaAtivo
        ? filtrosAtuais.filter((t) => t !== tipo)
        : [...filtrosAtuais, tipo];
    });
  }, []);

  if (buscandoGeo) {
    return <TelaCarregando mensagem="Obtendo sua localização..." />;
  }

  if (erroGeo) {
    return (
      <TelaErro
        mensagem={`Erro de localização: ${erroGeo}`}
        onTentar={buscarPrestadores}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <FiltroServico filtrosAtivos={filtrosTipos} onAlternar={alternarFiltro} />
      {carregandoAPI ? (
        <TelaCarregando mensagem="Carregando prestadores próximos..." />
      ) : erroAPI ? (
        <TelaErro mensagem={erroAPI} onTentar={buscarPrestadores} />
      ) : (
        <MapaView
          prestadores={prestadoresFiltrados}
          centro={[centroLat, centroLng]}
        />
      )}
    </div>
  );
}
