# Axis Mobili — MVP Implementation Guide

## 🎯 Objetivo
Lançar MVP funcional com:
- Kanban Venda + Medição (drag-drop)
- Configurações de Etapas (customizável)
- Atribuição de Responsáveis
- Dashboard com alertas
- Sistema de Faturamento (mensal/por projeto)
- Integração EvolutionAPI (config apenas)

## 📦 Stack
- **Frontend:** React 18 + TypeScript + Vite + TailwindCSS
- **Backend:** Fastify + TypeScript
- **Database:** Firebase (Firestore + Authentication)
- **Deployment:** Hostinger (VPS + EasyPanel)

---

## 📁 Estrutura Firebase

```
firestore/
├── configuracoes/{empresa_id}/
│   ├── empresa (document)
│   ├── etapas (document) — ConfigEtapas
│   ├── permissoes (document) — Record<PerfilUsuario, PermissoesPerfil>
│   └── notificacoes (document) — ConfigNotificacoes
│
├── clientes/ (existente, adicionar faturamento config)
├── projetos/ (atualizar com etapas dinâmicas)
├── usuarios/ (atualizar com responsabilidades)
├── faturas/ (novo, para faturamento)
└── notificacoes/ (novo, histórico de alertas)
```

---

## 🔄 Fluxo de Dados

### 1. Criação de Projeto
```
1. User clica em "Novo Projeto"
2. Form preenche dados (cliente, tipo, ambientes)
3. Backend busca ConfigEtapas do tipo (projeto_venda, etc)
4. Cria Projeto com etapas[] baseado em ConfigEtapas
5. Atribui responsáveis padrão (ou vazio)
```

### 2. Mudança de Etapa (Kanban)
```
1. User arrasta card para nova coluna
2. Frontend valida SLA (alerta se passou)
3. Backend atualiza: etapa.status, etapa.dataFim
4. Cria HistoricoItem
5. Dispara notificação (se ativo)
```

### 3. Faturamento
```
Mensal:
- Cron diário verifica clientes com tipo='mensal'
- Se hoje é dia de faturamento, agrupa projetos do mês
- Cria Fatura com todos os projetos finalizados

Por Projeto:
- Ao mover projeto para "Concluído"
- Cria Fatura com apenas esse projeto
- Se tem % entrada, cria 2 faturas (entrada + restante)
```

---

## 📋 Checklist MVP

### FASE 1: Setup Inicial (1-2 dias)

**Backend:**
- [ ] Criar service de configurações (get/update)
- [ ] Criar service de etapas (listar, validar SLA)
- [ ] Atualizar routes de projetos (usar etapas dinâmicas)
- [ ] Atualizar service de projetos (criar com etapas)
- [ ] Criar service de notificações (enviar alerta)

**Frontend:**
- [ ] Atualizar global.types.ts (✅ FEITO)
- [ ] Criar hook useConfiguracoes (get config)
- [ ] Criar hook useEtapas (get etapas por tipo)
- [ ] Criar hook useFaturamento (calcular, criar)
- [ ] Criar service de configurações (CRUD)

### FASE 2: Funcionalidades Core (5-7 dias)

**Kanban:**
- [ ] Componente KanbanBoard (grid de colunas)
- [ ] Componente KanbanCard (draggable)
- [ ] Integração com React Query (drag-drop update)
- [ ] Validações de SLA (visual alerts)
- [ ] Modal de detalhes (projeto + etapas)

**Configurações:**
- [ ] UI de Etapas (CRUD etapas)
- [ ] UI de Permissões (selecionar por perfil)
- [ ] UI de EvolutionAPI (config + test)
- [ ] UI de Feriados (existente, ajustar)

**Dashboard:**
- [ ] Resumo de projetos (por etapa)
- [ ] Alertas de SLA (em risco)
- [ ] Gráficos básicos (Recharts)
- [ ] Faturamento do mês

**Atribuição:**
- [ ] Modal de atribuir responsável
- [ ] Select de usuários (com avatares)
- [ ] Indicador visual no card

### FASE 3: Faturamento (2-3 dias)

**Backend:**
- [ ] Service de faturamento (calcular valores)
- [ ] Route de criar fatura (manual ou automática)
- [ ] Lógica de % entrada

**Frontend:**
- [ ] Tela de Faturas (listagem)
- [ ] Modal de gerar fatura
- [ ] Editar fatura (rascunho)
- [ ] Exportar PDF (usar react-pdf)

---

## 🚀 Prioridades

1. **Kanban Venda** (mais usado)
2. **Kanban Medição** (mais simples)
3. **Configurações de Etapas**
4. **Dashboard** (resumo rápido)
5. **Atribuição de Responsáveis**
6. **Faturamento**

---

## 📝 Notas Importantes

- **Etapas são configuráveis:** Não hardcodear em código, buscar sempre do Firestore
- **SLA em dias úteis:** Usar BusinessDaysService existente
- **Notificações:** Começar com alert() no browser, depois integrar EvolutionAPI
- **Permissões:** Validar no backend com middleware, confiar nas permissões
- **Responsáveis:** Campo opcional, pode deixar vazio e atribuir depois

---

## 🔗 Referências

- Firebase Firestore: https://firebase.google.com/docs/firestore
- React DnD: https://react-dnd.github.io
- Recharts: https://recharts.org
- React PDF: https://react-pdf.org

---

## 👤 Contatos

- **Usuário:** digicasastore@gmail.com
- **Branch:** claude/blissful-mayer-Qngzu
- **Deploy:** Hostinger VPS + EasyPanel + Firebase
