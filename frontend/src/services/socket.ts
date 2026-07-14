import { io, Socket } from "socket.io-client";
import { EventosCliente, EventosServidor } from "../types/chat.types";

export function criarSocket(): Socket<EventosServidor, EventosCliente> {
  const token = localStorage.getItem("token");

  return io("http://localhost:3001", {
    auth: { token },
    autoConnect: false,
  });
}

const socket = criarSocket();

export default socket;
