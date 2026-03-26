# 🏢 Axis Mobili — Sistema de Gestão de Serviços

Sistema de gestão completo para empresa de prestação de serviços para lojas de móveis planejados.

## 🚀 Funcionalidades

- **Cadastro de Clientes** (lojas) com precificação personalizada
- **Cadastro de Projetos** com ambientes e acompanhamento por etapas
- **3 Kanbans** — Projeto Venda, Projeto Executivo, Medição Técnica
- **Controle de SLA** em dias úteis (com feriados brasileiros)
- **Faturamento** com geração de PDF profissional
- **Dashboard** com gráficos e alertas
- **Relatórios** de produtividade, volume, tempo médio e faturamento
- **Sistema de Notificações**
- **PWA** — instalável como app no celular

## 📋 Pré-requisitos

- **Node.js** 18+ ([https://nodejs.org](https://nodejs.org))
- **Conta Firebase** gratuita ([https://console.firebase.google.com](https://console.firebase.google.com))

---

## 🔥 Configuração do Firebase (Passo a Passo)

### 1. Criar Projeto Firebase
1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Clique em **"Adicionar projeto"**
3. Dê o nome "axis-mobili" e siga os passos

### 2. Ativar Authentication
1. No menu lateral, vá em **Authentication** → **Get started**
2. Clique em **"Email/Senha"** e ative o provedor
3. Clique em **Salvar**

### 3. Criar Firestore Database
1. No menu lateral, vá em **Firestore Database** → **Criar banco de dados**
2. Selecione **"Iniciar no modo de teste"** (ajustaremos as regras depois)
3. Escolha a região (southamerica-east1 para o Brasil)

### 4. Ativar Storage (para logo)
1. No menu lateral, vá em **Storage** → **Get started**
2. Aceite as regras padrão

### 5. Obter Credenciais do Cliente (Frontend)
1. Em **Configurações do Projeto** (⚙️) → **Geral**
2. Em **"Seus apps"**, clique em **"Adicionar app" → Web (</\>)**
3. Dê o nome "axis-mobili-web"
4. Copie os valores de `firebaseConfig`:
   - `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`

### 6. Gerar Service Account Key (Backend)
1. Em **Configurações do Projeto** → **Contas de serviço**
2. Clique em **"Gerar nova chave privada"**
3. Salve o arquivo JSON baixado
4. Converta para base64:

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("caminho\para\service-account.json"))
```

**Linux/Mac:**
```bash
base64 -i service-account.json | tr -d '\n'
```

5. Use esse valor na variável `FIREBASE_SERVICE_ACCOUNT_KEY`

---

## ⚡ Instalação Local

```bash
# Clonar repositório
git clone <repo-url>
cd axis-mobili

# Instalar dependências do frontend
cd client && npm install

# Instalar dependências do backend
cd ../server && npm install
```

### Configurar Variáveis de Ambiente

**Frontend (`client/.env`):**
```
cp client/.env.example client/.env
# Edite com suas credenciais Firebase
```

**Backend (`server/.env`):**
```
cp server/.env.example server/.env
# Edite com sua service account key em base64
```

### Rodar Seed (dados iniciais)
```bash
cd server && npm run seed
```

### Rodar em Desenvolvimento
```bash
# Terminal 1 — Frontend
cd client && npm run dev

# Terminal 2 — Backend
cd server && npm run dev
```

O frontend estará em `http://localhost:5173` e o backend em `http://localhost:3000`.

---

## 👤 Criar Primeiro Usuário Admin

1. No **Firebase Console** → **Authentication** → Clique em **"Adicionar usuário"**
2. Defina email e senha
3. Copie o **UID** gerado
4. No **Firestore**, crie manualmente:
   - Collection: `usuarios`
   - Document ID: _(cole o UID)_
   - Campos:
     - `nome`: "Administrador" _(string)_
     - `email`: "seu@email.com" _(string)_
     - `perfil`: "admin" _(string)_
     - `ativo`: true _(boolean)_
     - `criadoEm`: _(timestamp — agora)_
     - `atualizadoEm`: _(timestamp — agora)_

---

## 🐳 Deploy com Docker (EasyPanel)

1. No GitHub, faça push do código
2. No EasyPanel: **Criar novo app → Docker**
3. Conecte o repositório GitHub
4. Branch: `main`, Dockerfile: `./Dockerfile`
5. Configure as variáveis de ambiente
6. Ative HTTPS (Let's Encrypt automático)

---

## 📁 Estrutura do Projeto

```
axis-mobili/
├── client/          # Frontend React + TypeScript + Tailwind
│   ├── src/
│   │   ├── app/         # App, Router, ThemeProvider
│   │   ├── components/  # Layout, UI (shadcn), Common
│   │   ├── features/    # Módulos (auth, clientes, projetos, etc.)
│   │   ├── hooks/       # Hooks globais
│   │   ├── lib/         # Firebase, utils
│   │   └── types/       # Tipos globais
│   └── ...
├── server/          # Backend Fastify + TypeScript
│   └── src/
│       ├── config/      # Firebase Admin
│       ├── middleware/   # Auth, Permissions
│       ├── routes/      # API routes
│       ├── services/    # Business logic
│       └── server.ts    # Entry point
└── README.md
```
