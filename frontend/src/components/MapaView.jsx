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
  filtroAtivos,
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
        {Object.keys()}
      </section>
    </div>

    // <MapContainer
    //   center={centro}
    //   zoom={14}
    //   style={{ height: "400px", width: "100%" }}
    // >
    //   <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    //   <Marker position={centro} icon={ICONES.usuario}>
    //     <Popup>Você está aqui</Popup>
    //   </Marker>
    //   {prestadores.map((prestador) => (
    //     <Marker
    //       key={prestador.id}
    //       position={[prestador.latitude, prestador.longitude]}
    //       icon={ICONES[prestador.tipo_servico] || ICONES.mecanico}
    //     >
    //       <Popup>
    //         <div>
    //           <h3>{prestador.nome}</h3>
    //           <p>{prestador.tipo_servico}</p>
    //           <p>
    //             Distância: {parseFloat(prestador.distancia_km || 0).toFixed(2)}{" "}
    //             km
    //           </p>
    //         </div>
    //       </Popup>
    //     </Marker>
    //   ))}
    // </MapContainer>
  );
}
