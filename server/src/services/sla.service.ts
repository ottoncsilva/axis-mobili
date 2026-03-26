import { adminDb } from '../config/firebase-admin.js';
import { adicionarDiasUteis, isDiaUtil, contarDiasUteis } from './businessDays.service.js';
import type { ConfigFeriados } from '../types/index.js';

interface SLACheckResult {
  projetoId: string;
  diasUteisConsumidos: number;
  diasUteisRestantes: number;
  prazo: number;
  status: 'no_prazo' | 'atencao' | 'atrasado';
}

async function getConfigFeriados(): Promise<ConfigFeriados> {
  const configDoc = await adminDb.collection('configuracoes').doc('geral').get();
  if (configDoc.exists) {
    const data = configDoc.data();
    return data?.feriados || { sabadoDiaUtil: false, feriadosPadrao: [], feriadosCustom: [] };
  }
  return { sabadoDiaUtil: false, feriadosPadrao: [], feriadosCustom: [] };
}

export async function verificarSLAProjetos(): Promise<SLACheckResult[]> {
  const config = await getConfigFeriados();

  // Get config for SLA thresholds
  const configDoc = await adminDb.collection('configuracoes').doc('geral').get();
  const alertaDias = configDoc.exists ? (configDoc.data()?.notificacoes?.alertaSLADias || 2) : 2;

  // Get all active projects (not concluded)
  const projetosSnap = await adminDb
    .collection('projetos')
    .where('etapaAtual', '!=', 'concluido')
    .get();

  const results: SLACheckResult[] = [];

  for (const doc of projetosSnap.docs) {
    const projeto = doc.data();
    const sla = projeto.sla;

    if (!sla?.etapaInicio || !sla?.prazoEtapa) continue;

    const inicioEtapa = sla.etapaInicio.toDate();
    const prazo = sla.prazoEtapa;

    // Count business days from start
    const hoje = new Date();
    let diasUteisConsumidos = 0;
    let current = new Date(inicioEtapa);
    current.setDate(current.getDate() + 1);

    while (current <= hoje) {
      if (isDiaUtil(current, config)) {
        diasUteisConsumidos++;
      }
      current.setDate(current.getDate() + 1);
    }

    const diasUteisRestantes = prazo - diasUteisConsumidos;

    let status: 'no_prazo' | 'atencao' | 'atrasado';
    if (diasUteisRestantes < 0) {
      status = 'atrasado';
    } else if (diasUteisRestantes <= alertaDias) {
      status = 'atencao';
    } else {
      status = 'no_prazo';
    }

    results.push({
      projetoId: doc.id,
      diasUteisConsumidos,
      diasUteisRestantes,
      prazo,
      status,
    });
  }

  return results;
}
