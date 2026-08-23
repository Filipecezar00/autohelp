## AutoHelp

> Software para rastrear prestadores de serviços automotivos em sua região

![Status](https://img.shields.io/badge/status-em%20produção-success)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)

##  Projeto

O **AutoHelp** busca auxiliar usuários a encontrar mecânicos, guinchos e borracheiros próximos de sua região de forma ágil. O sistema possibilita entrar em contato em tempo real com o prestador e criar solicitações para serviços de emergência através de um mapa interativo que exibe os profissionais disponíveis e suas informações.

##  Tecnologias Utilizadas 

* **Frontend:** React, Vite, CSS
* **Backend:** Node.js, MySQL, WebSocket
* **APIs & Libs:** Leaflet.js, Fetch API

---

###  Demonstração das Telas

**Tela de Login**
<img width="656" height="532" alt="Tela de Login" src="https://github.com/user-attachments/assets/99dc5408-36a1-4f6d-a696-d8203f35594b" />

**Mapa Interativo**
<img width="1365" height="611" alt="Tela do Mapa" src="https://github.com/user-attachments/assets/9bacfcf1-a70b-4fc7-98ad-eab441bb6f8a" />

**Chat e Mensagens**
<img width="1365" height="597" alt="Tela de Mensagens" src="https://github.com/user-attachments/assets/cb32abe2-9087-4896-94a5-5eea081a72eb" />

**Perfil do Usuário**
<img width="1346" height="607" alt="Tela de Perfil" src="https://github.com/user-attachments/assets/26b7c7b3-3395-42ee-adf3-7f647a841879" />

**Histórico de Conversas**
<img width="1366" height="602" alt="Histórico de Conversas" src="https://github.com/user-attachments/assets/75bbbbc8-dce6-47a2-be38-933b3a22ff5c" />

**Histórico de Solicitações**
<img width="1364" height="606" alt="Histórico de Solicitações" src="https://github.com/user-attachments/assets/0b55c8d5-00b7-4809-a351-60841a3f4d3d" />

**Painel do Prestador**
<img width="1365" height="608" alt="Painel do Prestador" src="https://github.com/user-attachments/assets/6ebbbdde-2813-48ac-83b1-c9f16fff5d15" />

---

##  Execute Localmente

* Clone o repositório: `git clone https://github.com/Filipecezar00/autohelp.git`
* Acesse a pasta e instale as dependências: `npm install`
* Configure as variáveis de ambiente criando um `.env` na raiz do projeto (adicione a chave `VITE_API_URL=http://localhost:3001`).
* Inicie o servidor local digitando: `npm run dev`
