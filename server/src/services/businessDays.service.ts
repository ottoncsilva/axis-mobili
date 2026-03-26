import {
  addDays,
  startOfDay,
  isSameDay,
  isSunday,
  isSaturday,
  differenceInCalendarDays,
} from 'date-fns';
import type { ConfigFeriados } from '../types/index.js';

// ===== ALGORITMO DA PÁSCOA =====
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
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(ano, mes - 1, dia);
}

export function calcularFeriadosVariaveis(ano: number): Array<{ nome: string; data: Date }> {
  const pascoa = calcularPascoa(ano);
  return [
    { nome: 'Carnaval', data: addDays(pascoa, -47) },
    { nome: 'Sexta-feira Santa', data: addDays(pascoa, -2) },
    { nome: 'Corpus Christi', data: addDays(pascoa, 60) },
  ];
}

export function obterFeriadosAno(ano: number, config: ConfigFeriados): Date[] {
  const feriados: Date[] = [];

  const variaveis = calcularFeriadosVariaveis(ano);
  variaveis.forEach((f) => feriados.push(startOfDay(f.data)));

  [...config.feriadosPadrao, ...config.feriadosCustom]
    .filter((f) => f.ativo)
    .forEach((f) => {
      if (f.recorrente) {
        const [dia, mes] = f.data.split('/').map(Number);
        if (dia && mes) feriados.push(new Date(ano, mes - 1, dia));
      } else if (f.ano === ano) {
        const [dia, mes] = f.data.split('/').map(Number);
        if (dia && mes) feriados.push(new Date(ano, mes - 1, dia));
      }
    });

  return feriados.map((d) => startOfDay(d));
}

export function isDiaUtil(date: Date, config: ConfigFeriados): boolean {
  const d = startOfDay(date);
  if (isSunday(d)) return false;
  if (isSaturday(d) && !config.sabadoDiaUtil) return false;

  const feriadosAno = obterFeriadosAno(d.getFullYear(), config);
  return !feriadosAno.some((f) => isSameDay(f, d));
}

export function adicionarDiasUteis(date: Date, dias: number, config: ConfigFeriados): Date {
  let current = startOfDay(date);
  let remaining = dias;

  while (remaining > 0) {
    current = addDays(current, 1);
    if (isDiaUtil(current, config)) remaining--;
  }

  return current;
}

export function contarDiasUteis(inicio: Date, fim: Date, config: ConfigFeriados): number {
  const inicioD = startOfDay(inicio);
  const fimD = startOfDay(fim);

  if (isSameDay(inicioD, fimD)) return 0;

  let count = 0;
  let current = addDays(inicioD, 1);

  while (differenceInCalendarDays(fimD, current) > 0) {
    if (isDiaUtil(current, config)) count++;
    current = addDays(current, 1);
  }

  return count;
}
