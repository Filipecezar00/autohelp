import L from "leaflet";
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

const ICONES = {
  mecanico: criarIconeCustomizado(FaKey, "#3b82f6"),
  borracheiro: criarIconeCustomizado(PiTire, "#f97316"),
  guincho: criarIconeCustomizado(FaTruck, "#ef4444"),
  usuario: L.divIcon({
    html: '<div style="font-size:30px;">⭐</div>',
    className: "",
  }),
};

export default function MapaView({ centro, prestadores }) {
  if (!centro || centro.length !== 2) return null;
  if (prestadores.length === 0) {
    return (
      <div>
        <p style={{ color: "#3b82f6" }}>
          Nenhum Prestador disponivel em sua região.
        </p>
      </div>
    );
  }
  return (
    <MapContainer
      center={centro}
      zoom={14}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={centro} icon={ICONES.usuario}>
        <Popup>Você está aqui</Popup>
      </Marker>
      {prestadores.map((prestador) => (
        <Marker
          key={prestador.id}
          position={[prestador.latitude, prestador.longitude]}
          icon={ICONES[prestador.tipo_servico] || ICONES.mecanico}
        >
          <Popup>
            <div>
              <h3>{prestador.nome}</h3>
              <p>{prestador.tipo_servico}</p>
              <p>
                Distância: {parseFloat(prestador.distancia_km || 0).toFixed(2)}{" "}
                km
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
