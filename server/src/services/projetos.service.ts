import { adminDb } from '../config/firebase-admin.js';
import { FieldValue } from 'firebase-admin/firestore';

function getEtapaInicial(tipo: string): string {
  switch (tipo) {
    case 'projeto_venda': return 'aguardando_inicio';
    case 'projeto_executivo': return 'aguardando_inicio';
    case 'medicao': return 'aguardando_medicao';
    default: return 'aguardando_inicio';
  }
}

async function calcularValor(
  clienteId: string,
  tipo: string,
  valorVenda?: number,
  valorFabrica?: number,
  valorCombinado?: number,
  numAmbientes?: number
): Promise<number | null> {
  const clienteDoc = await adminDb.collection('clientes').doc(clienteId).get();
  if (!clienteDoc.exists) return null;

  const cliente = clienteDoc.data();
  const precificacaoMap: Record<string, string> = {
    projeto_venda: 'projetoVenda',
    projeto_executivo: 'projetoExecutivo',
    medicao: 'medicao',
  };

  const config = cliente?.precificacao?.[precificacaoMap[tipo]];
  if (!config) return null;

  switch (config.tipo) {
    case 'percentual_venda':
      return valorVenda ? (valorVenda * config.valor) / 100 : null;
    case 'percentual_fabrica':
      return valorFabrica ? (valorFabrica * config.valor) / 100 : null;
    case 'valor_combinado':
      return valorCombinado || null;
    case 'valor_fixo_ambiente':
      return numAmbientes ? config.valor * numAmbientes : null;
    default:
      return null;
  }
}

export const projetosService = {
  async listar(filtros?: { busca?: string; tipoServico?: string; statusFaturamento?: string; clienteId?: string }) {
    let snapshot = await adminDb.collection('projetos').orderBy('criadoEm', 'desc').get();
    let projetos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    if (filtros?.clienteId) {
      projetos = projetos.filter((p: any) => p.clienteId === filtros.clienteId);
    }

    if (filtros?.tipoServico && filtros.tipoServico !== 'todos') {
      projetos = projetos.filter((p: any) => p.tipoServico === filtros.tipoServico);
    }

    if (filtros?.statusFaturamento && filtros.statusFaturamento !== 'todos') {
      projetos = projetos.filter((p: any) => p.statusFaturamento === filtros.statusFaturamento);
    }

    if (filtros?.busca) {
      const busca = filtros.busca.toLowerCase();
      projetos = projetos.filter((p: any) =>
        p.clienteNome?.toLowerCase().includes(busca) ||
        p.clienteFinal?.nome?.toLowerCase().includes(busca) ||
        p.ambientes?.some((a: any) => a.nome?.toLowerCase().includes(busca))
      );
    }

    return projetos;
  },

  async buscarPorId(id: string) {
    const doc = await adminDb.collection('projetos').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  async listarPorCliente(clienteId: string) {
    const snapshot = await adminDb.collection('projetos')
      .where('clienteId', '==', clienteId)
      .orderBy('criadoEm', 'desc')
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  async criar(data: any) {
    const now = FieldValue.serverTimestamp();
    const etapaInicial = getEtapaInicial(data.tipoServico);

    const valorCalculado = await calcularValor(
      data.clienteId,
      data.tipoServico,
      data.valorVenda,
      data.valorFabrica,
      data.valorCombinado,
      data.ambientes?.length
    );

    const docData = {
      clienteId: data.clienteId,
      clienteNome: data.clienteNome,
      tipoServico: data.tipoServico,
      clienteFinal: {
        nome: data.clienteFinal?.nome || '',
        telefone: data.clienteFinal?.telefone || null,
        email: data.clienteFinal?.email || null,
        endereco: data.clienteFinal?.endereco || null,
      },
      ambientes: (data.ambientes || []).map((a: any, index: number) => ({
        id: `amb_${Date.now()}_${index}`,
        nome: a.nome,
        observacoes: a.observacoes || null,
        etapasConcluidas: {},
      })),
      etapaAtual: etapaInicial,
      valorVenda: data.valorVenda || null,
      valorFabrica: data.valorFabrica || null,
      valorCombinado: data.valorCombinado || null,
      valorCalculado,
      linkGoogleDrive: data.linkGoogleDrive || null,
      responsaveis: {},
      sla: {
        etapaInicio: now,
        prazoEtapa: 0,
        diasUtilizados: 0,
      },
      statusFaturamento: 'em_andamento',
      historico: [],
      observacoes: data.observacoes || null,
      criadoEm: now,
      atualizadoEm: now,
    };

    const docRef = await adminDb.collection('projetos').add(docData);
    return docRef.id;
  },

  async atualizar(id: string, data: any) {
    const updateData: Record<string, any> = {
      atualizadoEm: FieldValue.serverTimestamp(),
    };

    if (data.clienteFinal !== undefined) updateData.clienteFinal = data.clienteFinal;
    if (data.ambientes !== undefined) {
      updateData.ambientes = data.ambientes.map((a: any, index: number) => ({
        id: `amb_${Date.now()}_${index}`,
        nome: a.nome,
        observacoes: a.observacoes || null,
        etapasConcluidas: {},
      }));
    }
    if (data.valorVenda !== undefined) updateData.valorVenda = data.valorVenda || null;
    if (data.valorFabrica !== undefined) updateData.valorFabrica = data.valorFabrica || null;
    if (data.valorCombinado !== undefined) updateData.valorCombinado = data.valorCombinado || null;
    if (data.linkGoogleDrive !== undefined) updateData.linkGoogleDrive = data.linkGoogleDrive || null;
    if (data.observacoes !== undefined) updateData.observacoes = data.observacoes || null;

    // Recalculate value if relevant fields changed
    if (data.clienteId && (data.valorVenda !== undefined || data.valorFabrica !== undefined || data.valorCombinado !== undefined || data.ambientes !== undefined)) {
      const existing = await adminDb.collection('projetos').doc(id).get();
      const tipo = data.tipoServico || existing.data()?.tipoServico;
      const valorCalculado = await calcularValor(
        data.clienteId,
        tipo,
        data.valorVenda,
        data.valorFabrica,
        data.valorCombinado,
        data.ambientes?.length
      );
      updateData.valorCalculado = valorCalculado;
    }

    await adminDb.collection('projetos').doc(id).update(updateData);
  },
};
