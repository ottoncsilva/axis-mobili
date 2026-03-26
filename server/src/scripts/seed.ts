/**
 * Script de seed — popula o Firestore com configurações iniciais.
 * Execute com: npm run seed
 *
 * Pré-requisito: FIREBASE_SERVICE_ACCOUNT_KEY configurado no .env
 */

import 'dotenv/config';
import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// ===== INIT FIREBASE =====
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountKey) {
  console.error('❌ FIREBASE_SERVICE_ACCOUNT_KEY não está configurada no .env');
  console.log('📖 Siga o README.md para gerar a chave de serviço.');
  process.exit(1);
}

let serviceAccount: ServiceAccount;
try {
  serviceAccount = JSON.parse(
    Buffer.from(serviceAccountKey, 'base64').toString('utf-8')
  ) as ServiceAccount;
} catch {
  console.error('❌ Erro ao decodificar FIREBASE_SERVICE_ACCOUNT_KEY (deve ser base64)');
  process.exit(1);
}

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// ===== DADOS DE SEED =====
const configuracoes = {
  empresa: {
    nome: 'Axis Mobili',
    cnpj: '',
    endereco: '',
    telefone: '',
    email: '',
    logoUrl: '',
  },
  permissoes: {
    admin: {
      dashboard: true,
      clientes: { visualizar: true, criar: true, editar: true, excluir: true },
      projetos: { visualizar: true, criar: true, editar: true, excluir: true },
      kanbanVenda: { visualizar: true, operar: true },
      kanbanExecutivo: { visualizar: true, operar: true },
      kanbanMedicao: { visualizar: true, operar: true },
      faturamento: { visualizar: true, criar: true, editar: true },
      colaboradores: { visualizar: true, criar: true, editar: true, excluir: true },
      relatorios: true,
      configuracoes: true,
    },
    projetista: {
      dashboard: true,
      clientes: { visualizar: true, criar: false, editar: false, excluir: false },
      projetos: { visualizar: true, criar: true, editar: true, excluir: false },
      kanbanVenda: { visualizar: true, operar: true },
      kanbanExecutivo: { visualizar: true, operar: true },
      kanbanMedicao: { visualizar: false, operar: false },
      faturamento: { visualizar: false, criar: false, editar: false },
      colaboradores: { visualizar: false, criar: false, editar: false, excluir: false },
      relatorios: false,
      configuracoes: false,
    },
    medidor: {
      dashboard: true,
      clientes: { visualizar: true, criar: false, editar: false, excluir: false },
      projetos: { visualizar: true, criar: false, editar: true, excluir: false },
      kanbanVenda: { visualizar: false, operar: false },
      kanbanExecutivo: { visualizar: false, operar: false },
      kanbanMedicao: { visualizar: true, operar: true },
      faturamento: { visualizar: false, criar: false, editar: false },
      colaboradores: { visualizar: false, criar: false, editar: false, excluir: false },
      relatorios: false,
      configuracoes: false,
    },
    financeiro: {
      dashboard: true,
      clientes: { visualizar: true, criar: false, editar: false, excluir: false },
      projetos: { visualizar: true, criar: false, editar: false, excluir: false },
      kanbanVenda: { visualizar: true, operar: false },
      kanbanExecutivo: { visualizar: true, operar: false },
      kanbanMedicao: { visualizar: true, operar: false },
      faturamento: { visualizar: true, criar: true, editar: true },
      colaboradores: { visualizar: false, criar: false, editar: false, excluir: false },
      relatorios: true,
      configuracoes: false,
    },
  },
  sla: {
    projetoVenda: {
      aguardando_inicio: 1,
      projetar_ambientes: 3,
      projetar_mobiliario: 5,
      aprovacao: 2,
      renderizar: 3,
      montar_apresentacao: 2,
      alteracao: 3,
    },
    projetoExecutivo: {
      aguardando_inicio: 1,
      projetar_ambientes: 3,
      projetar_mobiliario: 5,
      aprovacao_1: 2,
      detalhamento: 5,
      aprovacao_2: 2,
      alteracao: 3,
    },
    medicao: {
      aguardando_medicao: 2,
      medicao_agendada: 3,
      medicao_realizada: 2,
      consolidado_enviado: 2,
    },
  },
  feriados: {
    sabadoDiaUtil: false,
    feriadosPadrao: [
      { id: 'confraternizacao', nome: 'Confraternização Universal', data: '01/01', recorrente: true, ativo: true },
      { id: 'tiradentes', nome: 'Tiradentes', data: '21/04', recorrente: true, ativo: true },
      { id: 'trabalho', nome: 'Dia do Trabalho', data: '01/05', recorrente: true, ativo: true },
      { id: 'independencia', nome: 'Independência do Brasil', data: '07/09', recorrente: true, ativo: true },
      { id: 'aparecida', nome: 'Nossa Senhora Aparecida', data: '12/10', recorrente: true, ativo: true },
      { id: 'finados', nome: 'Finados', data: '02/11', recorrente: true, ativo: true },
      { id: 'republica', nome: 'Proclamação da República', data: '15/11', recorrente: true, ativo: true },
      { id: 'natal', nome: 'Natal', data: '25/12', recorrente: true, ativo: true },
    ],
    feriadosCustom: [],
  },
  tema: 'escuro',
  notificacoes: {
    alertaSLADias: 2,
    notificarNovaAtribuicao: true,
    notificarEtapaConcluida: true,
    notificarSLAProximo: true,
    notificarSLAEstourado: true,
    notificarFaturaVencida: true,
  },
};

// ===== EXECUTAR SEED =====
async function seed() {
  console.log('🌱 Iniciando seed do Firestore...\n');

  // 1. Configurações gerais
  console.log('📝 Criando configurações gerais...');
  await db.collection('configuracoes').doc('geral').set(configuracoes);
  console.log('   ✅ Configurações criadas\n');

  // 2. Contadores
  console.log('📝 Criando contadores...');
  await db.collection('contadores').doc('faturas').set({ ultimo: 0 });
  console.log('   ✅ Contadores criados\n');

  console.log('✨ Seed concluído com sucesso!');
  console.log('\n📋 Próximos passos:');
  console.log('   1. Crie um usuário no Firebase Authentication');
  console.log('   2. No Firestore, crie um documento em "usuarios" com o UID');
  console.log('   3. Preencha: nome, email, perfil="admin", ativo=true');
  console.log('   4. Veja o README.md para detalhes completos.');
}

seed().catch((err) => {
  console.error('❌ Erro no seed:', err);
  process.exit(1);
});
