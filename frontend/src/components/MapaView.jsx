import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { FaKey, FaTruck } from "react-icons/fa";
import { PiTire } from "react-icons/pi";
import { renderToStaticMarkup } from "react-dom/server";

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
