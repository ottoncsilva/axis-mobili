import { adminDb } from '../config/firebase-admin.js';
import { FieldValue } from 'firebase-admin/firestore';
import type { ConfigEtapas, PermissoesPerfil, ConfigNotificacoes, PerfilUsuario } from '../types/index.js';

const EMPRESA_ID = 'default';

interface ConfigEmpresa {
  nome: string;
  cnpj?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  logoUrl?: string;
}

interface Feriado {
  id: string;
  nome: string;
  data: string;
  recorrente: boolean;
  ano?: number;
  ativo: boolean;
}

interface ConfigFeriados {
  sabadoDiaUtil: boolean;
  feriadosPadrao: Feriado[];
  feriadosCustom: Feriado[];
}

const EMPRESA_PADRAO: ConfigEmpresa = {
  nome: 'Axis Mobili',
  cnpj: '',
  endereco: '',
  telefone: '',
  email: '',
  logoUrl: '',
};

const FERIADOS_PADRAO: ConfigFeriados = {
  sabadoDiaUtil: false,
  feriadosPadrao: [
    { id: 'confraternizacao', nome: 'Confraternização Universal', data: '01/01', recorrente: true, ativo: true },
    { id: 'tiradentes', nome: 'Tiradentes', data: '21/04', recorrente: true, ativo: true },
    { id: 'trabalho', nome: 'Dia do Trabalho', data: '01/05', recorrente: true, ativo: true },
    { id: 'independencia', nome: 'Independência do Brasil', data: '07/09', recorrente: true, ativo: true },
    { id: 'aparecida', nome: 'N. Sra. Aparecida', data: '12/10', recorrente: true, ativo: true },
    { id: 'finados', nome: 'Finados', data: '02/11', recorrente: true, ativo: true },
    { id: 'republica', nome: 'Proclamação da República', data: '15/11', recorrente: true, ativo: true },
    { id: 'natal', nome: 'Natal', data: '25/12', recorrente: true, ativo: true },
  ],
  feriadosCustom: [],
};

// Modelos padrão de etapas
const ETAPAS_PADRAO_VENDA: ConfigEtapas['projetoVenda'] = [
  { id: 'aguardando_inicio', nome: 'aguardando_inicio', label: 'Aguardando Início', ordem: 1, sla: 1 },
  { id: 'projetar_ambientes', nome: 'projetar_ambientes', label: 'Projetar Ambientes', ordem: 2, sla: 5 },
  { id: 'projetar_mobiliario', nome: 'projetar_mobiliario', label: 'Projetar Mobiliário', ordem: 3, sla: 5 },
  { id: 'aprovacao', nome: 'aprovacao', label: 'Aprovação', ordem: 4, sla: 3 },
  { id: 'renderizar', nome: 'renderizar', label: 'Renderizar', ordem: 5, sla: 3 },
  { id: 'montar_apresentacao', nome: 'montar_apresentacao', label: 'Montar Apresentação', ordem: 6, sla: 2 },
  { id: 'alteracao', nome: 'alteracao', label: 'Alteração', ordem: 7, sla: 5 },
  { id: 'concluido', nome: 'concluido', label: 'Concluído', ordem: 8, sla: 0 },
];

const ETAPAS_PADRAO_EXECUTIVO: ConfigEtapas['projetoExecutivo'] = [
  { id: 'aguardando_inicio', nome: 'aguardando_inicio', label: 'Aguardando Início', ordem: 1, sla: 1 },
  { id: 'projetar_ambientes', nome: 'projetar_ambientes', label: 'Projetar Ambientes', ordem: 2, sla: 5 },
  { id: 'projetar_mobiliario', nome: 'projetar_mobiliario', label: 'Projetar Mobiliário', ordem: 3, sla: 5 },
  { id: 'aprovacao_1', nome: 'aprovacao_1', label: 'Aprovação', ordem: 4, sla: 3 },
  { id: 'detalhamento', nome: 'detalhamento', label: 'Detalhamento', ordem: 5, sla: 5 },
  { id: 'aprovacao_2', nome: 'aprovacao_2', label: 'Aprovação Final', ordem: 6, sla: 3 },
  { id: 'alteracao', nome: 'alteracao', label: 'Alteração', ordem: 7, sla: 5 },
  { id: 'concluido', nome: 'concluido', label: 'Concluído', ordem: 8, sla: 0 },
];

const ETAPAS_PADRAO_MEDICAO: ConfigEtapas['medicao'] = [
  { id: 'aguardando_medicao', nome: 'aguardando_medicao', label: 'Aguardando Medição', ordem: 1, sla: 3 },
  { id: 'medicao_agendada', nome: 'medicao_agendada', label: 'Medição Agendada', ordem: 2, sla: 5 },
  { id: 'medicao_realizada', nome: 'medicao_realizada', label: 'Medição Realizada', ordem: 3, sla: 2 },
  { id: 'consolidado_enviado', nome: 'consolidado_enviado', label: 'Consolidado e Enviado', ordem: 4, sla: 1 },
  { id: 'concluido', nome: 'concluido', label: 'Concluído', ordem: 5, sla: 0 },
];

const PERMISSOES_PADRAO: Record<PerfilUsuario, PermissoesPerfil> = {
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
    faturamento: { visualizar: true, criar: false, editar: false },
    colaboradores: { visualizar: false, criar: false, editar: false, excluir: false },
    relatorios: true,
    configuracoes: false,
  },
  medidor: {
    dashboard: true,
    clientes: { visualizar: true, criar: false, editar: false, excluir: false },
    projetos: { visualizar: true, criar: true, editar: true, excluir: false },
    kanbanVenda: { visualizar: false, operar: false },
    kanbanExecutivo: { visualizar: false, operar: false },
    kanbanMedicao: { visualizar: true, operar: true },
    faturamento: { visualizar: true, criar: false, editar: false },
    colaboradores: { visualizar: false, criar: false, editar: false, excluir: false },
    relatorios: true,
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
};

const CONFIG_NOTIFICACOES_PADRAO: ConfigNotificacoes = {
  alertaSLADias: 2,
  notificarNovaAtribuicao: true,
  notificarEtapaConcluida: true,
  notificarSLAProximo: true,
  notificarSLAEstourado: true,
  notificarFaturaVencida: true,
  evolution: {
    ativo: false,
    apiUrl: '',
    apiKey: '',
    instancia: '',
    telefonesAlerta: [],
  },
};

export const configuracoesService = {
  async getEtapas(): Promise<ConfigEtapas> {
    const doc = await adminDb
      .collection('configuracoes')
      .doc(EMPRESA_ID)
      .collection('etapas')
      .doc('config')
      .get();

    if (!doc.exists) {
      return {
        projetoVenda: ETAPAS_PADRAO_VENDA,
        projetoExecutivo: ETAPAS_PADRAO_EXECUTIVO,
        medicao: ETAPAS_PADRAO_MEDICAO,
      };
    }

    return doc.data() as ConfigEtapas;
  },

  async updateEtapas(config: ConfigEtapas): Promise<void> {
    await adminDb
      .collection('configuracoes')
      .doc(EMPRESA_ID)
      .collection('etapas')
      .doc('config')
      .set(config, { merge: true });
  },

  async getPermissoes(): Promise<Record<PerfilUsuario, PermissoesPerfil>> {
    const doc = await adminDb
      .collection('configuracoes')
      .doc(EMPRESA_ID)
      .collection('permissoes')
      .doc('config')
      .get();

    if (!doc.exists) {
      return PERMISSOES_PADRAO;
    }

    return doc.data() as Record<PerfilUsuario, PermissoesPerfil>;
  },

  async updatePermissoes(config: Record<PerfilUsuario, PermissoesPerfil>): Promise<void> {
    await adminDb
      .collection('configuracoes')
      .doc(EMPRESA_ID)
      .collection('permissoes')
      .doc('config')
      .set(config, { merge: true });
  },

  async getNotificacoes(): Promise<ConfigNotificacoes> {
    const doc = await adminDb
      .collection('configuracoes')
      .doc(EMPRESA_ID)
      .collection('notificacoes')
      .doc('config')
      .get();

    if (!doc.exists) {
      return CONFIG_NOTIFICACOES_PADRAO;
    }

    return doc.data() as ConfigNotificacoes;
  },

  async updateNotificacoes(config: ConfigNotificacoes): Promise<void> {
    await adminDb
      .collection('configuracoes')
      .doc(EMPRESA_ID)
      .collection('notificacoes')
      .doc('config')
      .set(config, { merge: true });
  },

  async getEmpresa(): Promise<ConfigEmpresa> {
    const doc = await adminDb
      .collection('configuracoes')
      .doc(EMPRESA_ID)
      .collection('empresa')
      .doc('config')
      .get();

    if (!doc.exists) return EMPRESA_PADRAO;
    return { ...EMPRESA_PADRAO, ...doc.data() } as ConfigEmpresa;
  },

  async updateEmpresa(config: ConfigEmpresa): Promise<void> {
    await adminDb
      .collection('configuracoes')
      .doc(EMPRESA_ID)
      .collection('empresa')
      .doc('config')
      .set(config, { merge: true });
  },

  async getFeriados(): Promise<ConfigFeriados> {
    const doc = await adminDb
      .collection('configuracoes')
      .doc(EMPRESA_ID)
      .collection('feriados')
      .doc('config')
      .get();

    if (!doc.exists) return FERIADOS_PADRAO;
    const data = doc.data() as any;
    return {
      sabadoDiaUtil: data.sabadoDiaUtil ?? false,
      feriadosPadrao: data.feriadosPadrao ?? FERIADOS_PADRAO.feriadosPadrao,
      feriadosCustom: data.feriadosCustom ?? [],
    };
  },

  async updateFeriados(config: ConfigFeriados): Promise<void> {
    await adminDb
      .collection('configuracoes')
      .doc(EMPRESA_ID)
      .collection('feriados')
      .doc('config')
      .set(config);
  },

  async getConfiguracoes() {
    const [etapas, permissoes, notificacoes, empresa] = await Promise.all([
      this.getEtapas(),
      this.getPermissoes(),
      this.getNotificacoes(),
      this.getEmpresa(),
    ]);

    return { etapas, permissoes, notificacoes, empresa };
  },

  // Initialize with defaults if not exists
  async inicializar(): Promise<void> {
    const configDoc = await adminDb
      .collection('configuracoes')
      .doc(EMPRESA_ID)
      .get();

    if (!configDoc.exists) {
      await adminDb
        .collection('configuracoes')
        .doc(EMPRESA_ID)
        .set({
          criadoEm: FieldValue.serverTimestamp(),
          atualizadoEm: FieldValue.serverTimestamp(),
        });
    }

    // Initialize etapas
    const etapasDoc = await adminDb
      .collection('configuracoes')
      .doc(EMPRESA_ID)
      .collection('etapas')
      .doc('config')
      .get();

    if (!etapasDoc.exists) {
      await adminDb
        .collection('configuracoes')
        .doc(EMPRESA_ID)
        .collection('etapas')
        .doc('config')
        .set({
          projetoVenda: ETAPAS_PADRAO_VENDA,
          projetoExecutivo: ETAPAS_PADRAO_EXECUTIVO,
          medicao: ETAPAS_PADRAO_MEDICAO,
        });
    }

    // Initialize permissoes
    const permissoesDoc = await adminDb
      .collection('configuracoes')
      .doc(EMPRESA_ID)
      .collection('permissoes')
      .doc('config')
      .get();

    if (!permissoesDoc.exists) {
      await adminDb
        .collection('configuracoes')
        .doc(EMPRESA_ID)
        .collection('permissoes')
        .doc('config')
        .set(PERMISSOES_PADRAO);
    }

    // Initialize notificacoes
    const notificacoesDoc = await adminDb
      .collection('configuracoes')
      .doc(EMPRESA_ID)
      .collection('notificacoes')
      .doc('config')
      .get();

    if (!notificacoesDoc.exists) {
      await adminDb
        .collection('configuracoes')
        .doc(EMPRESA_ID)
        .collection('notificacoes')
        .doc('config')
        .set(CONFIG_NOTIFICACOES_PADRAO);
    }
  },
};
