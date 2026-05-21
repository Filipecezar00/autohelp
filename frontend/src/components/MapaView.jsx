import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { FaKey, FaTruck } from "react-icons/fa";
import { PiTire } from "react-icons/pi";
import { renderToStaticMarkup } from "react-dom/server";
import "leaflet/dist/leaflet.css";

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
    <div className="max-w-6xl mx-auto p-4">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Prestadores proximos a sua região
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {prestadores.length} prestadores encontrados
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <aside className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-700">
              Resultados ({prestadores.length})
            </h2>
          </div>
          <div className="p-4 max-h-[460px] overflow-y-auto flex flex-col gap-3">
            {prestadores.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">
                Nenhum Prestador nessa categoria
              </p>
            ) : (
              prestadores.map((p) => (
                <CardListaPrestador key={p.id} prestador={p} />
              ))
            )}
          </div>
        </aside>
        <main className="lg:col-span-2 rounded-xl overflow-hidden shadow-sm border-gray-100">
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
                <span className="font-semibold text-sm">Você está aqui</span>
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
