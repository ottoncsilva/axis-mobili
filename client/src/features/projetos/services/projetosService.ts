import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  orderBy,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Projeto, Cliente, TipoServico, ETAPAS_PROJETO_VENDA, ETAPAS_PROJETO_EXECUTIVO, ETAPAS_MEDICAO } from '@/types/global.types';
import type { ProjetoFormData, ProjetosFiltros } from '../types/projetos.types';

const COLLECTION = 'projetos';

// Retorna a primeira etapa de acordo com o tipo de serviço
function getEtapaInicial(tipo: TipoServico): string {
  switch (tipo) {
    case 'projeto_venda': return 'aguardando_inicio';
    case 'projeto_executivo': return 'aguardando_inicio';
    case 'medicao': return 'aguardando_medicao';
  }
}

// Calcula o valor do projeto baseado na precificação do cliente
function calcularValor(
  cliente: Cliente,
  tipo: TipoServico,
  valorVenda?: number,
  valorFabrica?: number,
  valorCombinado?: number,
  numAmbientes?: number
): number | undefined {
  const precificacaoMap = {
    projeto_venda: cliente.precificacao?.projetoVenda,
    projeto_executivo: cliente.precificacao?.projetoExecutivo,
    medicao: cliente.precificacao?.medicao,
  };

  const config = precificacaoMap[tipo];
  if (!config) return undefined;

  switch (config.tipo) {
    case 'percentual_venda':
      return valorVenda ? (valorVenda * config.valor) / 100 : undefined;
    case 'percentual_fabrica':
      return valorFabrica ? (valorFabrica * config.valor) / 100 : undefined;
    case 'valor_combinado':
      return valorCombinado;
    case 'valor_fixo_ambiente':
      return numAmbientes ? config.valor * numAmbientes : undefined;
  }
}

export const projetosService = {
  async listar(filtros?: ProjetosFiltros): Promise<Projeto[]> {
    const q = query(collection(db, COLLECTION), orderBy('criadoEm', 'desc'));
    const snapshot = await getDocs(q);

    let projetos = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Projeto[];

    // Filtros client-side
    if (filtros) {
      if (filtros.tipoServico !== 'todos') {
        projetos = projetos.filter((p) => p.tipoServico === filtros.tipoServico);
      }

      if (filtros.statusFaturamento !== 'todos') {
        projetos = projetos.filter((p) => p.statusFaturamento === filtros.statusFaturamento);
      }

      if (filtros.busca) {
        const busca = filtros.busca.toLowerCase();
        projetos = projetos.filter(
          (p) =>
            p.clienteNome.toLowerCase().includes(busca) ||
            p.clienteFinal.nome.toLowerCase().includes(busca) ||
            p.ambientes.some((a) => a.nome.toLowerCase().includes(busca))
        );
      }
    }

    return projetos;
  },

  async buscarPorId(id: string): Promise<Projeto | null> {
    const docRef = doc(db, COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Projeto;
    }
    return null;
  },

  async listarPorCliente(clienteId: string): Promise<Projeto[]> {
    const q = query(
      collection(db, COLLECTION),
      where('clienteId', '==', clienteId),
      orderBy('criadoEm', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Projeto[];
  },

  async criar(data: ProjetoFormData): Promise<string> {
    const now = Timestamp.now();

    // Buscar dados do cliente para calcular valor
    const clienteDoc = await getDoc(doc(db, 'clientes', data.clienteId));
    const cliente = clienteDoc.exists()
      ? ({ id: clienteDoc.id, ...clienteDoc.data() } as Cliente)
      : null;

    // Calcular valor
    const valorCalculado = cliente
      ? calcularValor(
          cliente,
          data.tipoServico,
          data.valorVenda,
          data.valorFabrica,
          data.valorCombinado,
          data.ambientes.length
        )
      : undefined;

    const etapaInicial = getEtapaInicial(data.tipoServico);

    const docData = {
      clienteId: data.clienteId,
      clienteNome: data.clienteNome,
      tipoServico: data.tipoServico,
      clienteFinal: {
        nome: data.clienteFinal.nome,
        telefone: data.clienteFinal.telefone || null,
        email: data.clienteFinal.email || null,
        endereco: data.clienteFinal.endereco || null,
      },
      ambientes: data.ambientes.map((a, index) => ({
        id: `amb_${Date.now()}_${index}`,
        nome: a.nome,
        observacoes: a.observacoes || null,
        etapasConcluidas: {},
      })),
      etapaAtual: etapaInicial,
      valorVenda: data.valorVenda || null,
      valorFabrica: data.valorFabrica || null,
      valorCombinado: data.valorCombinado || null,
      valorCalculado: valorCalculado || null,
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

    const docRef = await addDoc(collection(db, COLLECTION), docData);
    return docRef.id;
  },

  async atualizar(id: string, data: Partial<ProjetoFormData>): Promise<void> {
    const docRef = doc(db, COLLECTION, id);
    const updateData: Record<string, unknown> = {
      atualizadoEm: Timestamp.now(),
    };

    if (data.clienteId !== undefined) updateData.clienteId = data.clienteId;
    if (data.clienteNome !== undefined) updateData.clienteNome = data.clienteNome;
    if (data.tipoServico !== undefined) updateData.tipoServico = data.tipoServico;
    if (data.clienteFinal !== undefined) {
      updateData.clienteFinal = {
        nome: data.clienteFinal.nome,
        telefone: data.clienteFinal.telefone || null,
        email: data.clienteFinal.email || null,
        endereco: data.clienteFinal.endereco || null,
      };
    }
    if (data.ambientes !== undefined) {
      updateData.ambientes = data.ambientes.map((a, index) => ({
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

    // Recalcular valor se dados relevantes mudaram
    if (data.clienteId && (data.valorVenda !== undefined || data.valorFabrica !== undefined || data.valorCombinado !== undefined || data.ambientes !== undefined)) {
      const clienteDoc = await getDoc(doc(db, 'clientes', data.clienteId));
      if (clienteDoc.exists()) {
        const cliente = { id: clienteDoc.id, ...clienteDoc.data() } as Cliente;
        const tipo = data.tipoServico || (await getDoc(docRef)).data()?.tipoServico;
        const valorCalculado = calcularValor(
          cliente,
          tipo,
          data.valorVenda,
          data.valorFabrica,
          data.valorCombinado,
          data.ambientes?.length
        );
        updateData.valorCalculado = valorCalculado || null;
      }
    }

    await updateDoc(docRef, updateData);
  },
};
