import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { FaKey, FaTruck } from "react-icons/fa";
import { PiTire } from "react-icons/pi";
import { renderToStaticMarkup } from "react-dom/server";
import "leaflet/dist/leaflet.css";
import { FiltroServico } from "./FiltroServico";

const CONFIG_TIPOS = {
  mecanico: {
    icone: FaKey,
    cor: "#3b82f6",
    bgClass: "bg-blue-500",
    textClass: "text-blue-500",
    label: "Mecânico",
  },
  borracheiro: {
    icone: PiTire,
    cor: "#f97316",
    bgClass: "bg-orange-500",
    textClass: "text-orange-500",
    label: "Borracheiro",
  },
  guincho: {
    icone: FaTruck,
    cor: "#ef4444",
    bgClass: "bg-red-500",
    textClass: "text-red-500",
    label: "Guincho",
  },
};
const criarIconeCustomizado = (IconeComponent, cor) => {
  const html = renderToStaticMarkup(
    <div style={{ color: cor, fontSize: "24px" }}>
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
    html: '<div style="font-size:30px;">⭐</div>',
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  }),
};

function CardListaPrestador({ prestador }) {
  const config = CONFIG_TIPOS[prestador.tipo_servico] ?? CONFIG_TIPOS.mecanico;
  const Icone = config.icone;

  return (
    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="flex justify-between items-start mb-1">
        <h3>{prestador.nome}</h3>
        <span
          className={`text-[11px] px-2 py-0.5 rounded-full font-semibold bg-white border ${config.textClass}`}
        >
          {config.label}
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-2">
        {prestador.telefone || "Sem telefone cadastrado"}
      </p>
      <div className="flex justify-between items-center text-xs font-semibold text-gray-600">
        <span className="flex items-center gap-1">
          <Icone className={config.textClass} />
          ver no mapa
        </span>
        <span className="text-gray-400">
          {Number(prestador.distancia_km ?? 0).toFixed(2)} km
        </span>
      </div>
    </div>
  );
}

function PopupPrestador({ prestador }) {
  const config = CONFIG_TIPOS[prestador.tipo_servico] ?? CONFIG_TIPOS.mecanico;

  return (
    <div className="p-1 min-w-[160px]">
      <h3 className="font-bold text-gray-800 text-sm border-b pb-1 mb-2">
        {prestador.nome}
      </h3>
      <p className="text-xs text-gray-600 mb-1">
        <span className="font-medium">Serviço:</span>
        {config.label}
      </p>
      <p className="text-xs text-gray-500 mb-1">
        {prestador.telefone || "Sem telefone"}
      </p>
      <p className={`text-xs font-bold ${config.textClass}`}>
        {Number(prestador.distancia_km ?? 0).toFixed(2)} km de você
      </p>
    </div>
  );
}

export default function MapaView({ centro, prestadores }) {
  if (!centro || centro.length !== 2) return null;
  return (
    <div className="w-full min-h-screen bg-slate-50 p-4 md:p-6 text-slate-800">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-right">
          Prestadores proximos a sua região
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          {prestadores.length}{" "}
          {prestadores.length === 1
            ? "Prestador encontrado"
            : "Prestadores encontrados"}
        </p>
      </header>

      <div className="mb-6 bg-white p-3 rounded-xl shadow-sm border border-slate-200/60">
        <FiltroServico
          tipo={tiposDeServico}
          filtrosAtivos={filtrosAtivos}
          onAlternar={onAlternar}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <aside className="lg:col-span-1 bg-white rounded-xl shadow-md border border-slate-200/60 flex flex-col overflow-hidden h-[500px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-bold text-slate-700 flex items-center justify-between">
              <span>Resultados</span>
              <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full">
                {prestadores.length}
              </span>
            </h2>
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

        <main className="lg:col-span-2 rounded-xl overflow-hidden shadow-md border border-slate-200/60 bg-white h-[500px]">
          <MapContainer
            center={centro}
            zoom={14}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            />
            <Marker position={centro} icon={ICONES.usuario}>
              <Popup>
                <span className="font-semibold text-sm text-slate-900">
                  Você está aqui
                </span>
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
