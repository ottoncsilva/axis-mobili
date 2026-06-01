# 🚀 Guia de Deploy — Axis Mobili no EasyPanel

## 📋 Pré-requisitos

- ✅ VPS na Hostinger com EasyPanel instalado
- ✅ Firebase project já criado e configurado
- ✅ Service Account key do Firebase (base64)
- ✅ Domínio apontado para a VPS
- ✅ GitHub repository com o código

---

## 🔧 Passo 1: Preparar Firebase

### 1.1 Obter Credenciais Firebase (Frontend)

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Vá em **Project Settings** (⚙️)
3. Clique em **"Your apps"** → **Web (</\>)**
4. Copie as credenciais:
   ```
   - apiKey
   - authDomain
   - projectId
   - storageBucket
   - messagingSenderId
   - appId
   ```

### 1.2 Obter Service Account Key (Backend)

1. Em **Project Settings** → **Service Accounts**
2. Clique em **"Generate new private key"**
3. Salve o arquivo JSON
4. **IMPORTANTE:** Converter para base64:

**Linux/Mac:**
```bash
base64 -i service-account.json | tr -d '\n'
```

**Windows PowerShell:**
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("service-account.json"))
```

Copie a string base64 — **você vai usar no EasyPanel**

---

## 🐳 Passo 2: Criar App no EasyPanel

### 2.1 Acessar EasyPanel

1. Acesse seu painel EasyPanel: `https://seu-vps-ip:3000`
2. Faça login com suas credenciais

### 2.2 Criar Novo App (Docker)

1. Clique em **"Apps"** no menu lateral
2. Clique em **"Add App"**
3. Preencha:
   - **Name:** `axis-mobili`
   - **Docker Repository:** `github.com/ottoncsilva/axis-mobili`
   - **Branch:** `main`
   - **Dockerfile Path:** `./Dockerfile`

### 2.3 Configurar Domínio

1. Clique em **"Services"** → **App Settings**
2. Em **Domains:**
   - Clique em **"Add Domain"**
   - Digite seu domínio (ex: `app.seudominio.com`)
   - Ative **HTTPS** (Let's Encrypt automático ✅)

---

## 🔑 Passo 3: Variáveis de Ambiente

No EasyPanel, em **Environment Variables**, adicione:

### Frontend (Cliente)

```
VITE_API_URL=https://seu-dominio.com/api
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx
```

### Backend (Servidor)

```
FIREBASE_SERVICE_ACCOUNT_KEY=eyJhbGc... (base64 da service account)
PORT=3000
HOST=0.0.0.0
NODE_ENV=production
FRONTEND_URL=https://seu-dominio.com
LOG_LEVEL=info
```

---

## 🎛️ Passo 4: Configurar Firestore

### Ativar Serviços

1. [Firebase Console](https://console.firebase.google.com)
2. **Authentication:**
   - Ative **Email/Password**

3. **Firestore Database:**
   - Crie banco de dados (modo test ou produção)
   - Região: `southamerica-east1` (Brasil)

4. **Storage:**
   - Ative Storage para logos

### Regras de Firestore (Produção)

No **Firestore Rules**, substitua pelo código abaixo:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Authenticated users only
    match /{document=**} {
      allow read, write: if request.auth != null;
    }

    // Specific rules for better security
    match /usuarios/{userId} {
      allow read: if request.auth.uid == userId || request.auth != null;
      allow write: if request.auth.uid == userId || hasRole('admin');
    }

    match /clientes/{clienteId} {
      allow read, write: if hasModule('clientes');
    }

    match /projetos/{projetoId} {
      allow read, write: if hasModule('projetos');
    }

    match /configuracoes/{companyId} {
      allow read: if request.auth != null;
      allow write: if hasRole('admin');
    }
  }

  function hasRole(role) {
    return get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.perfil == role;
  }

  function hasModule(module) {
    let userDoc = get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data;
    let permissoes = get(/databases/$(database)/documents/configuracoes/default/permissoes/config).data;
    return permissoes[userDoc.perfil][module].visualizar == true;
  }
}
```

---

## 🚀 Passo 5: Deploy

### 2.1 Fazer Push para GitHub

```bash
git push -u origin main
```

### 2.2 No EasyPanel

1. Clique em **"Deploy"**
2. Selecione **"Build from GitHub"**
3. Aguarde o build (2-5 minutos)
4. Acompanhe os logs

### 2.3 Verificar Saúde

1. Acesse `https://seu-dominio.com/api/health`
2. Deve retornar:
```json
{
  "status": "ok",
  "timestamp": "2026-06-01T19:30:00Z",
  "environment": "production"
}
```

---

## ✅ Pós-Deploy

### 1. Criar Primeiro Admin

1. [Firebase Console](https://console.firebase.google.com)
2. **Authentication** → **Add user**
3. Crie usuário: `admin@seu-dominio.com`
4. Copie o **UID** gerado
5. **Firestore** → **Collection: usuarios**
6. Documento ID = **UID**
7. Adicione campos:
   ```json
   {
     "nome": "Administrador",
     "email": "admin@seu-dominio.com",
     "perfil": "admin",
     "ativo": true,
     "criadoEm": Timestamp.now(),
     "atualizadoEm": Timestamp.now()
   }
   ```

### 2. Testar Login

1. Acesse `https://seu-dominio.com/login`
2. Faça login com `admin@seu-dominio.com`
3. Clique em **Dashboard** para verificar

### 3. Verificar Funcionalidades

- [ ] Dashboard carrega
- [ ] Kanban Venda mostra projetos
- [ ] Drag-drop funciona
- [ ] Configurações salvam
- [ ] Permissões aplicam

---

## 🔍 Troubleshooting

### Erro: "Failed to fetch"
- Verifique `VITE_API_URL` no frontend
- Verifique `FRONTEND_URL` no backend
- Confira CORS em `server.ts`

### Erro: "Firebase credentials invalid"
- Regenere a Service Account key
- Verifique conversão base64
- Copie novamente no EasyPanel

### Build falha
- Verifique logs no EasyPanel
- Rode localmente: `npm install && npm run build`
- Confira se o Dockerfile está correto

### HTTPS não funciona
- Aguarde 2-3 minutos para Let's Encrypt
- Acesse em HTTP primeiro
- Verifique domínio apontado

---

## 📊 Monitoramento

No EasyPanel, monitore:
- **CPU/Memory:** Não deve exceder 70%
- **Disk:** Limpe logs antigos regularmente
- **Logs:** Procure por erros no console

---

## 🔄 Atualizações Futuras

Para fazer deploy de novas versões:

```bash
git push origin main
```

No EasyPanel:
1. Clique em **"Redeploy"**
2. Aguarde novo build
3. Pronto! 🚀

---

## 📞 Suporte

- **Firebase:** https://firebase.google.com/docs
- **EasyPanel:** https://easypanel.io/docs
- **Código:** https://github.com/ottoncsilva/axis-mobili
