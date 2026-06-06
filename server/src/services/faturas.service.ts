import { adminDb, FieldValue } from '../config/firebase-admin.js';
import type { Projeto } from '../types/index.js';

export interface CriarFaturaData {
  clienteId: string;
  projetosIds: string[];
  tipo: 'mensal' | 'por_projeto';
  periodoInicio?: Date;
  periodoFim?: Date;
  percentualEntrada?: number;
  observacoes?: string;
}

export interface AtualizarFaturaData {
  status?: string;
  dataVencimento?: Date;
  dataPagamento?: Date;
  observacoes?: string;
}

async function gerarNumeroFatura(): Promise<string> {
  const contadorRef = adminDb.collection('contadores').doc('faturas');
  const result = await adminDb.runTransaction(async (transaction) => {
    const doc = await transaction.get(contadorRef);
    const ultimo = doc.exists ? (doc.data()?.ultimo || 0) : 0;
    const novo = ultimo + 1;
    transaction.set(contadorRef, { ultimo: novo });
    return novo;
  });

  const ano = new Date().getFullYear();
  return `FAT-${ano}-${String(result).padStart(6, '0')}`;
}

function calcularSubtotaisPorTipo(projetos: Projeto[]): {
  projetoVenda: number;
  projetoExecutivo: number;
  medicao: number;
} {
  const subtotais = {
    projetoVenda: 0,
    projetoExecutivo: 0,
    medicao: 0,
  };

  for (const projeto of projetos) {
    const tipo = projeto.tipoServico as keyof typeof subtotais;
    const valor = projeto.valorCalculado || 0;

    if (tipo in subtotais) {
      subtotais[tipo] += valor;
    }
  }

  return subtotais;
}

export const faturasService = {
  async listar(filtros?: { clienteId?: string; status?: string }) {
    let query = adminDb.collection('faturas').orderBy('criadoEm', 'desc');

    if (filtros?.clienteId) {
      query = query.where('clienteId', '==', filtros.clienteId) as any;
    }
    if (filtros?.status) {
      query = query.where('status', '==', filtros.status) as any;
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  },

  async buscarPorId(id: string) {
    const doc = await adminDb.collection('faturas').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  async criar(data: CriarFaturaData) {
    // Buscar projetos
    const projetosSnapshot = await adminDb
      .collection('projetos')
      .where(adminDb.FieldPath.documentId(), 'in', data.projetosIds)
      .get();

    const projetos = projetosSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Projeto[];

    if (projetos.length === 0) {
      throw new Error('Nenhum projeto encontrado');
    }

    // Verificar que todos os projetos são do mesmo cliente
    const clientesUnicos = new Set(projetos.map((p) => p.clienteId));
    if (clientesUnicos.size > 1 || !clientesUnicos.has(data.clienteId)) {
      throw new Error('Todos os projetos devem ser do mesmo cliente');
    }

    // Calcular subtotais
    const subtotais = calcularSubtotaisPorTipo(projetos);
    const valorTotalBruto = subtotais.projetoVenda + subtotais.projetoExecutivo + subtotais.medicao;

    // Calcular entrada (se aplicável)
    let valorEntrada = 0;
    if (data.percentualEntrada && data.percentualEntrada > 0) {
      valorEntrada = (valorTotalBruto * data.percentualEntrada) / 100;
    }

    const valorTotal = valorTotalBruto;
    const numero = await gerarNumeroFatura();
    const agora = new Date();

    // Criar itens da fatura
    const itens = projetos.map((projeto) => ({
      projetoId: projeto.id,
      clienteFinalNome: projeto.clienteFinal.nome,
      tipoServico: projeto.tipoServico,
      ambientes: projeto.ambientes.map((a) => a.nome),
      valorVendaOuFabrica: projeto.valorVenda || projeto.valorFabrica || 0,
      tipoPrecificacao: 'calculado',
      percentualOuValor: 1,
      valorCalculado: projeto.valorCalculado || 0,
      dataConclusao: projeto.concluidoEm || agora,
    }));

    const docRef = await adminDb.collection('faturas').add({
      numero,
      clienteId: data.clienteId,
      clienteNome: projetos[0].clienteNome,
      tipo: data.tipo,
      projetosIds: data.projetosIds,
      periodoInicio: data.periodoInicio || agora,
      periodoFim: data.periodoFim || agora,
      itens,
      subtotalProjetoVenda: subtotais.projetoVenda,
      subtotalProjetoExecutivo: subtotais.projetoExecutivo,
      subtotalMedicao: subtotais.medicao,
      percentualEntrada: data.percentualEntrada || null,
      valorEntrada: valorEntrada || null,
      valorTotal,
      status: 'rascunho',
      observacoes: data.observacoes || null,
      criadoEm: FieldValue.serverTimestamp(),
      atualizadoEm: FieldValue.serverTimestamp(),
    });

    return {
      id: docRef.id,
      numero,
      clienteId: data.clienteId,
      projetosIds: data.projetosIds,
      status: 'rascunho',
    };
  },

  async atualizar(id: string, data: AtualizarFaturaData) {
    const updateData: Record<string, any> = {
      atualizadoEm: FieldValue.serverTimestamp(),
    };

    if (data.status !== undefined) updateData.status = data.status;
    if (data.dataVencimento !== undefined) updateData.dataVencimento = data.dataVencimento;
    if (data.dataPagamento !== undefined) updateData.dataPagamento = data.dataPagamento;
    if (data.observacoes !== undefined) updateData.observacoes = data.observacoes || null;

    if (Object.keys(updateData).length === 1) {
      return; // Nada a atualizar além de atualizadoEm
    }

    await adminDb.collection('faturas').doc(id).update(updateData);
  },

  async excluir(id: string) {
    const fatura = await this.buscarPorId(id);
    if (!fatura) {
      throw new Error('Fatura não encontrada');
    }

    // Só permite excluir se status = rascunho
    if (fatura.status !== 'rascunho') {
      throw new Error('Apenas faturas em rascunho podem ser excluídas');
    }

    await adminDb.collection('faturas').doc(id).delete();
  },

  async emitir(id: string) {
    const fatura = await this.buscarPorId(id);
    if (!fatura) {
      throw new Error('Fatura não encontrada');
    }

    if (fatura.status !== 'rascunho') {
      throw new Error('Apenas rascunhos podem ser emitidos');
    }

    // Calcular data de vencimento padrão (30 dias)
    const dataVencimento = new Date();
    dataVencimento.setDate(dataVencimento.getDate() + 30);

    await this.atualizar(id, {
      status: 'emitida',
      dataVencimento,
    });
  },

  async registrarPagamento(id: string, dataPagamento: Date) {
    const fatura = await this.buscarPorId(id);
    if (!fatura) {
      throw new Error('Fatura não encontrada');
    }

    if (fatura.status === 'cancelada') {
      throw new Error('Não pode pagar fatura cancelada');
    }

    await this.atualizar(id, {
      status: 'paga',
      dataPagamento,
    });
  },

  async cancelar(id: string) {
    const fatura = await this.buscarPorId(id);
    if (!fatura) {
      throw new Error('Fatura não encontrada');
    }

    if (fatura.status === 'paga') {
      throw new Error('Não pode cancelar fatura já paga');
    }

    await this.atualizar(id, { status: 'cancelada' });
  },
};

export default faturasService;
