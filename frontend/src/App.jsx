import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Mapa from "./pages/Mapa";
import Cadastro from "./pages/Cadastro";
import PrivateRoute from "./components/PrivateRoute";
import AuthProvider from "./contexts/AuthContext";
import { Suspense, lazy } from "react";
import "leaflet/dist/leaflet.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense
          fallback={<div className="loading-spinner">Carregando...</div>}
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />

            <Route element={<PrivateRoute />}>
              <Route path="/home" element={<Home />} />
              <Route path="/mapa" element={<Mapa />} />
            </Route>
            <Route path="/" element={<Navigate to="/login" replace />}></Route>
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
