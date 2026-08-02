import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import PrivateRoute from "./components/PrivateRoute";
import { PainelPrestador } from "./pages/PainelPrestador";
import AuthProvider from "./contexts/AuthContext";
import { Suspense, lazy } from "react";
import "leaflet/dist/leaflet.css";
import Historico from "./pages/Historico";
import { Layout } from "./layouts/Layout";
import { Perfil } from "./pages/Perfil";
import { Chat } from "./pages/Chat";
import { ListaConversas } from "./components/listaConversas";
import socket from "./services/socket";
import { useEffect } from "react";

const Home = lazy(() => import("./pages/Home"));
const Mapa = lazy(() => import("./pages/Mapa"));
const Solicitacao = lazy(() => import("./pages/Solicitacao"));

export function App() {
  useEffect(() => {
    socket.auth = { token: localStorage.getItem("token") };

    if (!socket.connected) {
      socket.connect();
    }

    function tratarNovaNotificacao(dados: {
      conversaId: number;
      remetenteNome: string;
      texto: string;
    }) {
      console.log("ALERTA RECEBIDO NO FRONTEND:", dados);
      alert(`${dados.remetenteNome}:${dados.texto}`);
    }
    socket.on("notificacao_mensagem", tratarNovaNotificacao);

    return () => {
      socket.off("notificacao_mensagem", tratarNovaNotificacao);
    };
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense
          fallback={<div className="loading-spinner">Carregando...</div>}
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/" element={<Navigate to="login" replace />} />

            <Route element={<PrivateRoute />}>
              <Route element={<Layout />}>
                <Route path="/home" element={<Home />} />
                <Route path="/mapa" element={<Mapa />} />
                <Route
                  path="/solicitar/:prestadorId"
                  element={<Solicitacao />}
                />
                <Route path="/chat/:conversaId" element={<Chat />} />
                <Route path="/perfil" element={<Perfil />} />
                <Route path="/historico" element={<Historico />} />
                <Route path="/painelPrestador" element={<PainelPrestador />} />
                <Route path="/conversas/minhas" element={<ListaConversas />} />
              </Route>
            </Route>
            <Route
              path="*"
              element={<h2>Erro 404: Página não encontrada</h2>}
            ></Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
