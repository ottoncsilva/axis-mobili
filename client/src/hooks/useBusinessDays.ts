import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  isDiaUtil as isDiaUtilFn,
  contarDiasUteis as contarDiasUteisFn,
  adicionarDiasUteis as adicionarDiasUteisFn,
  calcularSLA as calcularSLAFn,
  type ConfigFeriados,
  type SLAResult,
} from '@/lib/businessDays';
import type { Configuracoes } from '@/types/global.types';

async function fetchConfigFeriados(): Promise<ConfigFeriados> {
  const configDoc = await getDoc(doc(db, 'configuracoes', 'geral'));
  if (configDoc.exists()) {
    const config = configDoc.data() as Configuracoes;
    return config.feriados;
  }
  // Default if no config exists
  return {
    sabadoDiaUtil: false,
    feriadosPadrao: [],
    feriadosCustom: [],
  };
}

export function useBusinessDays() {
  const { data: config, isLoading } = useQuery<ConfigFeriados>({
    queryKey: ['config-feriados'],
    queryFn: fetchConfigFeriados,
    staleTime: 1000 * 60 * 10, // 10 minutos — muda pouco
    gcTime: 1000 * 60 * 30,
  });

  const isDiaUtil = (date: Date): boolean => {
    if (!config) return true; // fallback while loading
    return isDiaUtilFn(date, config);
  };

  const contarDiasUteis = (inicio: Date, fim: Date): number => {
    if (!config) return 0;
    return contarDiasUteisFn(inicio, fim, config);
  };

  const adicionarDiasUteis = (date: Date, dias: number): Date => {
    if (!config) return date;
    return adicionarDiasUteisFn(date, dias, config);
  };

  const calcularSLA = (inicioEtapa: Date, prazoDiasUteis: number): SLAResult => {
    if (!config) {
      return {
        diasUteisTotais: prazoDiasUteis,
        diasUteisConsumidos: 0,
        diasUteisRestantes: prazoDiasUteis,
        dataLimite: new Date(),
        percentualConsumido: 0,
        status: 'no_prazo',
      };
    }
    return calcularSLAFn(inicioEtapa, prazoDiasUteis, config);
  };

  return {
    loading: isLoading,
    isDiaUtil,
    contarDiasUteis,
    adicionarDiasUteis,
    calcularSLA,
    config: config || null,
  };
}
