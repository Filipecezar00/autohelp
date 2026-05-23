import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { FaKey, FaTruck } from "react-icons/fa";
import Btn_return from "./RetornarHome";
import { PiTire } from "react-icons/pi";
import { renderToStaticMarkup } from "react-dom/server";
import "leaflet/dist/leaflet.css";

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
    <div
      className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer bg-white hover:shadow-md hover:-translate-y-0.5 ${config.border}`}
    >
      <div className="flex justify-between items-start gap-2 mb-2">
        <h3 className="font-semibold text-slate-800 text-sm leading-tight">
          {prestador.nome}
        </h3>
        <span
          className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-bold ${config.bgLight} ${config.textClass} border ${config.border}`}
        >
          {config.label}
        </span>
      </div>
      <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
        {prestador.telefone || "Sem telefone cadastrado"}
      </p>
      <div className="flex justify-between items-center">
        <span
          className={`flex items-center gap-1 text-xs font-semibold ${config.textClass}`}
        >
          <Icone size={12} />
          Ver no Mapa
        </span>
        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          {Number(prestador.distancia_km ?? 0).toFixed(1)} km
        </span>
      </div>
    </div>
  );
}

function PopupPrestador({ prestador }) {
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
      <span className="text-4xl mb-3">Search</span>
      <p className="text-sm font-semibold text-slate-500">
        Nenhum Prestador nessa categoria
      </p>
      <p className="text-xs text-slate-400 mt-1">
        Tente ampliar o raio de busca ou selecionar outro tipo
      </p>
    </div>
  );
}

export default function MapaView({ centro, prestadores = [] }) {
  if (!centro || centro.length !== 2) return null;
  return (
    <div className="w-full bg-slate-50 p-4 md:p-6">
      <span
        style={{
          cursor: "pointer",
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <Btn_return />
      </span>
      <header className="mb-5">
        <h1 className="text-2xl font-bold text-slate-900">
          Prestadores proximos a sua região
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {prestadores.length === 0
            ? "Nenhum Prestador encontrado nesta área"
            : `${prestadores.length} prestador${prestadores.length > 1 ? "es" : ""}`}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <aside className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-700">Resultados</h2>
            <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
              {prestadores.length}
            </span>
          </div>

          <div className="p-4 overflow-y-auto flex flex-col gap-3 flex-1 bg-white">
            {prestadores.length === 0 ? (
              <div className="py-12 text-center">
                <span className="text-3xl block mb-2">Search</span>
                <p className="text-sm font-medium text-slate-400">
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

            {prestadores.map((prestador) => (
              <Marker
                key={prestador.id}
                position={[prestador.latitude, prestador.longitude]}
                icon={ICONES[prestador.tipo_servico] ?? ICONES.mecanico}
              >
                <Popup>
                  <PopupPrestador prestador={prestador} />
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </main>
      </div>
    </div>
  );
}
