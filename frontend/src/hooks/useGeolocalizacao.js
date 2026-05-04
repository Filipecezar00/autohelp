import { useEffect, useState } from "react";

export default function useGeolocalizacao() {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setErro("Seu browser não suporta geolocalização");
      setCarregando(false);
      return;
    }
    const opcoes = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    const aoObterPosicao = (posicao) => {
      setLatitude(posicao.coords.latitude);
      setLongitude(posicao.coords.longitude);
      setCarregando(false);
    };

    const aoOcorrerErro = (erroDobrowser) => {
      let mensagem = "";

      switch (erroDobrowser.code) {
        case 1:
          mensagem =
            "Permissão negada, Habilite a localização no seu navegador.";
          break;
        case 2:
          mensagem = "Localização indisponível no momento.";
          break;
        case 3:
          mensagem = "Tempo esgotado ao buscar localização.";
          break;
        default:
          mensagem = "Ocorreu um erro desconhecido.";
      }
      setErro(mensagem);
      setCarregando(false);
    };
    navigator.geolocation.getCurrentPosition(
      aoObterPosicao,
      aoOcorrerErro,
      opcoes,
    );
  }, []);
  return { latitude, longitude, erro, carregando };
}
