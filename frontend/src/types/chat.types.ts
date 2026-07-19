export interface Mensagem {
  id: number;
  prestadorId: number;
  remetenteId: number;
  remetenteNome: string;
  texto: string;
  criadoEm: string;
}

export type StatusSolicitacao =
  | "pendente"
  | "aceita"
  | "recusada"
  | "concluida"
  | "cancelada";

export interface EventosServidor {
  nova_mensagem: (mensagem: Mensagem) => void;
  status_atualizado: (dados: {
    prestadorId: number;
    status: StatusSolicitacao;
  }) => void;
  erro: (mensagem: string) => void;
}

export interface EventosCliente {
  entrar_sala: (prestadorId: number) => void;
  enviar_mensagem: (dados: { texto: string; prestadorId: number }) => void;
  sair_sala: (prestadorId: number) => void;
}
