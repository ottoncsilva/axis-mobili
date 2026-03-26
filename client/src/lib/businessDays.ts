import {
  addDays,
  startOfDay,
  isSameDay,
  isSunday,
  isSaturday,
  differenceInCalendarDays,
  getYear,
  getMonth,
  getDate,
} from 'date-fns';

// ===== TYPES =====
export interface ConfigFeriados {
  sabadoDiaUtil: boolean;
  feriadosPadrao: Array<{ data: string; recorrente: boolean; ano?: number; ativo: boolean }>;
  feriadosCustom: Array<{ data: string; recorrente: boolean; ano?: number; ativo: boolean }>;
}

export interface SLAResult {
  diasUteisTotais: number;
  diasUteisConsumidos: number;
  diasUteisRestantes: number;
  dataLimite: Date;
  percentualConsumido: number;
  status: 'no_prazo' | 'atencao' | 'atrasado';
}

// ===== ALGORITMO DA PÁSCOA (Computus/Gauss) =====
/**
 * Calcula a data da Páscoa para um dado ano usando o algoritmo de Gauss/Computus.
 * Funciona para qualquer ano.
 */
export function calcularPascoa(ano: number): Date {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31); // 3=março, 4=abril
  const dia = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(ano, mes - 1, dia);
}

// ===== FERIADOS VARIÁVEIS =====
/**
 * Calcula feriados variáveis brasileiros baseados na Páscoa.
 * Carnaval = Páscoa - 47 dias
 * Sexta-feira Santa = Páscoa - 2 dias
 * Corpus Christi = Páscoa + 60 dias
 */
export function calcularFeriadosVariaveis(ano: number): Array<{ nome: string; data: Date }> {
  const pascoa = calcularPascoa(ano);

  return [
    { nome: 'Carnaval', data: addDays(pascoa, -47) },
    { nome: 'Sexta-feira Santa', data: addDays(pascoa, -2) },
    { nome: 'Corpus Christi', data: addDays(pascoa, 60) },
  ];
}

// ===== LISTA COMPLETA DE FERIADOS =====
/**
 * Retorna lista de todas as datas de feriados para um ano,
 * combinando feriados padrão, variáveis e customizados.
 */
export function obterFeriadosAno(ano: number, config: ConfigFeriados): Date[] {
  const feriados: Date[] = [];

  // Feriados variáveis (calculados pela Páscoa)
  const variaveis = calcularFeriadosVariaveis(ano);
  variaveis.forEach((f) => feriados.push(startOfDay(f.data)));

  // Feriados padrão (recorrentes com data DD/MM)
  config.feriadosPadrao
    .filter((f) => f.ativo)
    .forEach((f) => {
      if (f.recorrente) {
        const [dia, mes] = f.data.split('/').map(Number);
        if (dia && mes) {
          feriados.push(new Date(ano, mes - 1, dia));
        }
      } else if (f.ano === ano) {
        const [dia, mes] = f.data.split('/').map(Number);
        if (dia && mes) {
          feriados.push(new Date(ano, mes - 1, dia));
        }
      }
    });

  // Feriados customizados
  config.feriadosCustom
    .filter((f) => f.ativo)
    .forEach((f) => {
      if (f.recorrente) {
        const [dia, mes] = f.data.split('/').map(Number);
        if (dia && mes) {
          feriados.push(new Date(ano, mes - 1, dia));
        }
      } else if (f.ano === ano) {
        const [dia, mes] = f.data.split('/').map(Number);
        if (dia && mes) {
          feriados.push(new Date(ano, mes - 1, dia));
        }
      }
    });

  return feriados.map((d) => startOfDay(d));
}

// ===== VERIFICAR DIA ÚTIL =====
/**
 * Verifica se uma data é dia útil.
 * - Não é domingo
 * - Não é sábado (se config diz que não é útil)
 * - Não é feriado
 */
export function isDiaUtil(date: Date, config: ConfigFeriados): boolean {
  const d = startOfDay(date);

  // Domingo nunca é dia útil
  if (isSunday(d)) return false;

  // Sábado: depende da config
  if (isSaturday(d) && !config.sabadoDiaUtil) return false;

  // Verificar feriados do ano
  const feriadosAno = obterFeriadosAno(getYear(d), config);
  const isFeriado = feriadosAno.some((f) => isSameDay(f, d));
  if (isFeriado) return false;

  return true;
}

// ===== CONTAR DIAS ÚTEIS =====
/**
 * Conta dias úteis entre duas datas (exclusive a data fim).
 */
export function contarDiasUteis(inicio: Date, fim: Date, config: ConfigFeriados): number {
  const inicioD = startOfDay(inicio);
  const fimD = startOfDay(fim);

  // Se as datas são iguais ou início é depois do fim
  if (isSameDay(inicioD, fimD)) return 0;

  const isForward = differenceInCalendarDays(fimD, inicioD) > 0;
  let count = 0;
  let current = addDays(inicioD, isForward ? 1 : -1);

  while (isForward ? differenceInCalendarDays(fimD, current) > 0 : differenceInCalendarDays(current, fimD) > 0) {
    if (isDiaUtil(current, config)) {
      count++;
    }
    current = addDays(current, isForward ? 1 : -1);
  }

  // Include the last day if it's forward
  if (isForward && isDiaUtil(current, config) && isSameDay(current, fimD)) {
    // exclusive do fim — não conta
  }

  return count;
}

// ===== ADICIONAR DIAS ÚTEIS =====
/**
 * Adiciona N dias úteis a uma data, retornando a data resultante.
 */
export function adicionarDiasUteis(date: Date, dias: number, config: ConfigFeriados): Date {
  let current = startOfDay(date);
  let remaining = dias;

  while (remaining > 0) {
    current = addDays(current, 1);
    if (isDiaUtil(current, config)) {
      remaining--;
    }
  }

  return current;
}

// ===== CALCULAR SLA =====
/**
 * Calcula o status do SLA de uma etapa.
 */
export function calcularSLA(
  inicioEtapa: Date,
  prazoEtapaDiasUteis: number,
  config: ConfigFeriados
): SLAResult {
  const hoje = startOfDay(new Date());
  const inicio = startOfDay(inicioEtapa);

  // Data limite = início + prazo em dias úteis
  const dataLimite = adicionarDiasUteis(inicio, prazoEtapaDiasUteis, config);

  // Dias úteis consumidos = dias úteis de início até hoje
  let diasUteisConsumidos = 0;
  let current = addDays(inicio, 1);
  while (differenceInCalendarDays(hoje, current) >= 0) {
    if (isDiaUtil(current, config)) {
      diasUteisConsumidos++;
    }
    current = addDays(current, 1);
  }

  // Dias úteis restantes
  const diasUteisRestantes = prazoEtapaDiasUteis - diasUteisConsumidos;

  // Percentual consumido
  const percentualConsumido =
    prazoEtapaDiasUteis > 0
      ? Math.round((diasUteisConsumidos / prazoEtapaDiasUteis) * 100)
      : 100;

  // Status
  let status: 'no_prazo' | 'atencao' | 'atrasado';
  if (diasUteisRestantes < 0) {
    status = 'atrasado';
  } else if (percentualConsumido >= 50) {
    status = 'atencao';
  } else {
    status = 'no_prazo';
  }

  return {
    diasUteisTotais: prazoEtapaDiasUteis,
    diasUteisConsumidos,
    diasUteisRestantes,
    dataLimite,
    percentualConsumido,
    status,
  };
}

// ===== FERIADOS NACIONAIS PADRÃO =====
/**
 * Lista de feriados nacionais brasileiros pré-cadastrados.
 * Os feriados variáveis (Carnaval, Sexta-feira Santa, Corpus Christi) são
 * calculados pelo algoritmo da Páscoa, então não aparecem aqui.
 */
export const FERIADOS_NACIONAIS_PADRAO = [
  { id: 'confraternizacao', nome: 'Confraternização Universal', data: '01/01', recorrente: true, ativo: true },
  { id: 'carnaval', nome: 'Carnaval', data: '00/00', recorrente: true, ativo: true }, // variável
  { id: 'sexta_santa', nome: 'Sexta-feira Santa', data: '00/00', recorrente: true, ativo: true }, // variável
  { id: 'tiradentes', nome: 'Tiradentes', data: '21/04', recorrente: true, ativo: true },
  { id: 'trabalho', nome: 'Dia do Trabalho', data: '01/05', recorrente: true, ativo: true },
  { id: 'corpus_christi', nome: 'Corpus Christi', data: '00/00', recorrente: true, ativo: true }, // variável
  { id: 'independencia', nome: 'Independência do Brasil', data: '07/09', recorrente: true, ativo: true },
  { id: 'aparecida', nome: 'Nossa Senhora Aparecida', data: '12/10', recorrente: true, ativo: true },
  { id: 'finados', nome: 'Finados', data: '02/11', recorrente: true, ativo: true },
  { id: 'republica', nome: 'Proclamação da República', data: '15/11', recorrente: true, ativo: true },
  { id: 'natal', nome: 'Natal', data: '25/12', recorrente: true, ativo: true },
];
