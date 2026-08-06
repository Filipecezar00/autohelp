import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import PrivateRoute from "./components/PrivateRoute";
import { PainelPrestador } from "./pages/PainelPrestador";
import AuthProvider from "./contexts/AuthContext";
import { Suspense, lazy, useState } from "react";
import "leaflet/dist/leaflet.css";
import Historico from "./pages/Historico";
import { Layout } from "./layouts/Layout";
import { Perfil } from "./pages/Perfil";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Chat } from "./pages/Chat";
import { ListaConversas } from "./components/listaConversas";
import socket from "./services/socket";
import { useEffect } from "react";
import { TbTable } from "react-icons/tb";

const Home = lazy(() => import("./pages/Home"));
const Mapa = lazy(() => import("./pages/Mapa"));
const Solicitacao = lazy(() => import("./pages/Solicitacao"));

export function App() {
  useEffect(() => {
    console.log("[APP.jsx] Registrando ouvinte do Socket");
    socket.auth = { token: localStorage.getItem("token") };

    if (!socket.connected) {
      socket.connect();
    }

    socket.on("connect", () => {
      console.log("React conectado ao Socket! ID da conexão:", socket.id);
    });
    socket.on("notificacao_mensagem", (dados) => {
      toast.success(`${dados.remetenteNome}:${dados.texto}`);
    });

    return () => {
      console.log("[APP.jsx] Removendo ouvinte do Socket");
      socket.off("status_atualizado");
      socket.off("notificacao_mensagem");
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
          <ToastContainer />
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
