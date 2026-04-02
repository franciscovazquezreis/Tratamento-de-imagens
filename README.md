# Product Photo Studio AI

Esta aplicação permite editar fotografias de produtos usando a API do Google Gemini.

## Modo de Autenticação (BYOK)

A aplicação funciona exclusivamente em modo BYOK (Bring Your Own Key).
Ao abrir a aplicação, será mostrado um ecrã inicial a pedir a API key ao utilizador.
A chave é validada e guardada apenas em memória (React state) no browser do utilizador. Nunca é persistida em `localStorage` ou enviada para qualquer servidor.
As chamadas à Gemini API são feitas directamente do browser do utilizador.

## Instalação e Execução

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

3. Para compilar para produção:
   ```bash
   npm run build
   ```
