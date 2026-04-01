# Product Photo Studio AI

Esta aplicação permite editar fotografias de produtos usando a API do Google Gemini.

## Modos de Autenticação

A aplicação suporta dois modos de autenticação com a Gemini API:

### Modo A — Server-side proxy (Key do Dono)
Se a variável de ambiente `GEMINI_API_KEY` existir no servidor no momento do build, a aplicação usa-a silenciosamente.
Neste modo, as chamadas à Gemini API passam por um endpoint backend proxy (`/api/gemini`) que adiciona a chave no servidor. A chave **nunca** é exposta no frontend.
O utilizador não vê nenhum campo de API key e a aplicação arranca directamente na interface de tratamento de imagens.

### Modo B — BYOK / Bring Your Own Key (Visitantes)
Se a variável de ambiente `GEMINI_API_KEY` **não** existir (ou estiver vazia), a aplicação mostra um ecrã inicial a pedir a API key ao utilizador.
A chave é validada e guardada apenas em memória (React state) no browser do utilizador. Nunca é persistida em `localStorage` ou enviada para o servidor.
Neste modo, as chamadas à Gemini API são feitas directamente do browser do utilizador.

## Instalação e Execução

1. Instale as dependências:
   ```bash
   npm install
   ```

2. (Opcional) Configure a sua chave de API no ficheiro `.env`:
   ```env
   GEMINI_API_KEY="a-sua-chave-aqui"
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Para compilar para produção:
   ```bash
   npm run build
   npm start
   ```
