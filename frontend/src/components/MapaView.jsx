import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { FaKey, FaTruck } from "react-icons/fa";
import Btn_return from "./RetornarHome";
import { PiTire } from "react-icons/pi";
import { renderToStaticMarkup } from "react-dom/server";
import "leaflet/dist/leaflet.css";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../src/MapaView.module.css";

const CONFIG_TIPOS = {
  mecanico: {
    icone: FaKey,
    bgLight: "bg-blue-50",
    border: "border-blue-200",
    cor: "#3b82f6",
    bgClass: "bg-blue-500",
    textClass: "text-blue-500",
    label: "Mecânico",
  },
  borracheiro: {
    icone: PiTire,
    cor: "#f97316",
    bgLight: "bg-orange-50",
    border: "border-orange-200",
    bgClass: "bg-orange-500",
    textClass: "text-orange-500",
    label: "Borracheiro",
  },
  guincho: {
    icone: FaTruck,
    cor: "#ef4444",
    bgLight: "bg-red-50",
    border: "border-red-200",
    bgClass: "bg-red-500",
    textClass: "text-red-500",
    label: "Guincho",
  },
};

const criarIconeCustomizado = (IconeComponent, cor) => {
  const html = renderToStaticMarkup(
    <div
      style={{
        color: cor,
        fontSize: "24px",
        filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
      }}
    >
      <IconeComponent />
    </div>,
  );

  return L.divIcon({
    html,
    className: "icone-prestador",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });
};

const ICONES = {
  mecanico: criarIconeCustomizado(
    CONFIG_TIPOS.mecanico.icone,
    CONFIG_TIPOS.mecanico.cor,
  ),
  borracheiro: criarIconeCustomizado(
    CONFIG_TIPOS.borracheiro.icone,
    CONFIG_TIPOS.borracheiro.cor,
  ),
  guincho: criarIconeCustomizado(
    CONFIG_TIPOS.guincho.icone,
    CONFIG_TIPOS.guincho.cor,
  ),
  usuario: L.divIcon({
    html: '<div style="font-size:28px; filter:drop-shadow(0 1px 3px rgba(0,0,0,0.4))">⭐</div>',
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  }),
};

function CardListaPrestador({ prestador }) {
  const config = CONFIG_TIPOS[prestador.tipo_servico] ?? CONFIG_TIPOS.mecanico;
  const Icone = config.icone;

  return (
    <div className={styles.containerpai}>
      <div className={styles.container}>
        <h3 className={styles.prestadornome}>{prestador.nome}</h3>
        <span className={styles.prestadorbadge}>{config.label}</span>
      </div>
      <p className={styles.prestadortelefone}>
        {prestador.telefone || "Sem telefone cadastrado"}
      </p>
      <div className={styles.containerdois}>
        <span
          className={`flex items-center gap-1 text-xs font-semibold ${config.textClass}`}
        >
          <Icone size={12} className={styles.icone} />
          <p className={styles.vernomapa}>Ver no Mapa</p>
        </span>
        <span className={styles.km}>
          {Number(prestador.distancia_km ?? 0).toFixed(1)} km
        </span>
      </div>
    </div>
  );
}

function PopupPrestador({ prestador, onSolicitar }) {
  const config = CONFIG_TIPOS[prestador.tipo_servico] ?? CONFIG_TIPOS.mecanico;
  return (
    <div style={{ minWidth: 180, fontFamily: "sans-serif" }}>
      <div
        style={{
          display: "inline-block",
          background: config.cor,
          color: "#fff",
          fontSize: 10,
          fontWeight: 700,
          padding: "2px 8px",
          borderRadius: 20,
          marginBottom: 6,
        }}
      >
        {config.label}
      </div>
      <div
        style={{
          fontWeight: 700,
          fontSize: 14,
          color: "#1e293b",
          margimBottom: 4,
        }}
      >
        {prestador.nome}
      </div>
      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
        {prestador.telefone || "Sem telefone"}
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: config.cor }}>
        {Number(prestador.distancia_km ?? 0).toFixed(1)} km de você
      </div>

      <button
        onClick={onSolicitar}
        style={{
          marginTop: 10,
          width: "100%",
          padding: "7px 0",
          background: config.cor,
          color: "#fff",
          border: "none",
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Solicitar Serviço
      </button>
    </div>
  );
}

function EstadoVazio() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 text-center">
      <span className={styles.search}>Search</span>
      <p className={styles.nenhumprestador}>Nenhum Prestador nessa categoria</p>
      <p className={styles.tentativaampliar}>
        Tente ampliar o raio de busca ou selecionar outro tipo
      </p>
    </div>
  );
}

export default function MapaView({
  centro,
  prestadores = [],
  raioAtual = 10,
  onAlternarRaio,
}) {
  if (!centro || centro.length !== 2) return null;

  const [valorLocal, setValorLocal] = React.useState(raioAtual);
  const navigate = useNavigate();

  React.useEffect(() => {
    setValorLocal(raioAtual);
  }, [raioAtual]);
  return (
    <div className={styles.containerglobal}>
      <span
        style={{
          cursor: "pointer",
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          flexWrap: "wrap",
          color: "#e8f0ff",
        }}
      >
        <Btn_return />
      </span>
      <header className={styles.header}>
        <div className="space-y-1">
          <h1 className={styles.prestadoresproximos}>
            Prestadores proximos a sua região
          </h1>
          <p className={styles.prestadoresencontrados}>
            {prestadores.length === 0
              ? "Nenhum Prestador encontrado nesta área"
              : `${prestadores.length} prestador${prestadores.length > 1 ? "es" : ""}`}
          </p>
        </div>

        <div className={styles.containerRange}>
          <div className={styles.containerLabel}>
            <label htmlFor="raio-busca" className={styles.raiobusca}>
              Raio de Busca
            </label>{" "}
            <span className={styles.distancia}>Até {valorLocal} km</span>
          </div>
          <input
            id="raio-busca"
            type="range"
            min="1"
            max="50"
            step="1"
            value={valorLocal}
            onChange={(e) => setValorLocal(Number(e.target.value))}
            onMouseUp={() => onAlternarRaio(valorLocal)}
            onTouchEnd={() => onAlternarRaio(valorLocal)}
          />
          <div className={styles.containerdistancia}>
            <span className={styles.umkm}>1 km</span>
            <span className={styles.cinquentakm}>50 km</span>
          </div>
        </div>
      </header>

      <div className={styles.containerResultados}>
        <aside className={styles.asideResultados}>
          <div className={styles.containerresultados}>
            <h2 className={styles.resultados}>Resultados</h2>
            <span className={styles.numeroresultados}>
              {prestadores.length}
            </span>
          </div>

          <div className="p-4 overflow-y-auto flex flex-col gap-3 flex-1 bg-white">
            {prestadores.length === 0 ? (
              <div className={styles.containerprestadores}>
                <span className={styles.search}>Search</span>
                <p className={styles.nenhumprestador}>
                  Nenhum prestador ativo nesta Categoria
                </p>
              </div>
            ) : (
              prestadores.map((p) => (
                <CardListaPrestador key={p.id} prestador={p} />
              ))
            )}
          </div>
        </aside>

        <main className="lg:col-span-2 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
          <MapContainer
            center={centro}
            zoom={14}
            style={{ height: "500px", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            />
            <Marker position={centro} icon={ICONES.usuario}>
              <Popup>
                <div style={{ fontWeight: 600, fontSize: 13 }}>
                  Você está aqui
                </div>
              </Popup>
            </Marker>

            {prestadores.map((prestador) => {
              console.log("Investigando Prestador:", {
                objeto: prestador,
                chave: prestador.prestador_id,
              });
              return (
                <Marker
                  key={prestador.prestador_id}
                  position={[
                    Number(prestador.latitude),
                    Number(prestador.longitude),
                  ]}
                  icon={ICONES[prestador.tipo_servico] ?? ICONES.mecanico}
                >
                  <Popup>
                    <PopupPrestador
                      prestador={prestador}
                      onSolicitar={() =>
                        navigate(`/solicitar/${prestador.prestador_id}`, {
                          state: {
                            nome: prestador.nome,
                            distancia: prestador.distancia_km,
                          },
                        })
                      }
                    />
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </main>
      </div>
    </div>
  );
}
