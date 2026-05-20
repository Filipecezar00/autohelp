import L from "leaflet";
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { FaKey, FaTruck } from "react-icons/fa";
import { PiTire } from "react-icons/pi";
import { renderToStaticMarkup } from "react-dom/server";
import "leaflet/dist/leaflet.css";

const criarIconeCustomizado = (IconeComponent, cor) => {
  const htmlIcone = renderToStaticMarkup(
    <div style={{ color: cor, fontSize: "24px" }}>
      <IconeComponent />
    </div>,
  );

  return L.divIcon({
    html: htmlIcone,
    className: "meu-icone-customizado",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });
};

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
  }),
};

export default function MapaView({
  centro,
  prestadores,
  alternarFiltro,
  filtroAtivos = [],
}) {
  if (!centro || centro.length !== 2) return null;
  return (
    <div className="max-w-6xl mx-auto p-4 font-sans bg-gray-50 min-h-screen">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Prestadores proximos a sua região
        </h1>
      </header>

      <section className="flex flex-wrap gap-3 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <span className="text-sm font-medium text-gray-600 self-center mr-2">
          Filtrar por:
        </span>
        {Object.keys(CONFIG_TIPOS).map((tipo) => {
          const config = CONFIG_TIPOS[tipo];
          const Icone = config.icone;
          const ativo = filtroAtivos?.includes(tipo);

          return (
            <button
              key={tipo}
              onClick={() => alternarFiltro(tipo)}
              className={`flex itens-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm ${ativo ? `${config.bgClass} text-white ring-2 ring-offset-2 ring-gray-200 scale-100` : "bg-gray-100 text-gray-500 hover:bg-gray-200 scale-95"}`}
            >
              <Icone />
              {config.label}
            </button>
          );
        })}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <aside className="lg:col-span-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100 max-h-[500px] overflow-y-auto">
          <h2 className="font-semibold text-gray-700 mb-3 border-b pb-2">
            Resultados ({prestadores.length})
          </h2>
          {prestadores.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">
              Nenhum Prestador nesta categoria neste momento
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {prestadores.map((p) => {
                const config =
                  CONFIG_TIPOS[p.tipo_servico] || CONFIG_TIPOS.mecanico;
                const IconeCard = config.icone;
                return (
                  <div
                    key={p.id}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-300 transitio-colors"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-medium text-gray-800 text-sm">
                        {p.nome}
                      </h3>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-semibold bg-white border ${config.textClass}`}
                      >
                        {config.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      {p.telefone || "Sem telefone cadastrado"}
                    </p>
                    <div className="flex justify-between items-center text-xs font-semibold text-gray-600">
                      <span className="flex itens-center gap-1">
                        <IconeCard className={config.textClass} />
                        Ver no Mapa
                      </span>
                      <span className="text-gray-400">
                        {parseFloat(p.distancia_km || 0).toFixed(2)} km
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </aside>
        <main className="lg:col-span-2 rounded-xl overflow-hidden shadow-sm border border-gray-100 z-0">
          <MapContainer
            center={centro}
            zoom={14}
            style={{ height: "500px", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={centro} icon={ICONES.usuario}>
              <Popup>
                <span className="font-semibold text-gray-700">
                  Você está aqui
                </span>
              </Popup>
            </Marker>
            {prestadores.map((prestador) => (
              <Marker
                key={prestador.id}
                position={[prestador.latitude, prestador.longitude]}
                icon={ICONES[prestador.tipo_servico] || ICONES.mecanico}
              >
                <Popup>
                  <div className="p-1 font-sans">
                    <h3 className="font-bold text-gray-800 text-base border-b pb-1 mb-1">
                      {prestador.nome}
                    </h3>
                    <p className="text-xs text-gray-600 font-medium mb-1">
                      Serviço: {CONFIG_TIPOS[prestador.tipo_servico]?.label}
                    </p>
                    <p className="text-xs text-blue-600 font-bold">
                      Distância:{" "}
                      {parseFloat(prestador.distancia_km || 0).toFixed(2)} km
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </main>
      </div>
    </div>
  );
}
