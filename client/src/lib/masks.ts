// ===== MÁSCARAS DE INPUT =====

/**
 * Remove tudo que não é número
 */
export function unmaskNumber(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * CNPJ: XX.XXX.XXX/XXXX-XX
 */
export function maskCNPJ(value: string): string {
  const nums = unmaskNumber(value).slice(0, 14);
  return nums
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

/**
 * CEP: XXXXX-XXX
 */
export function maskCEP(value: string): string {
  const nums = unmaskNumber(value).slice(0, 8);
  return nums.replace(/^(\d{5})(\d)/, '$1-$2');
}

/**
 * Telefone: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 */
export function maskTelefone(value: string): string {
  const nums = unmaskNumber(value).slice(0, 11);
  if (nums.length <= 10) {
    return nums
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return nums
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

/**
 * Máscara monetária: R$ 1.234,56
 */
export function maskMoeda(value: string): string {
  const nums = unmaskNumber(value);
  if (!nums) return '';
  const valorCentavos = parseInt(nums, 10);
  const valor = valorCentavos / 100;
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ===== FORMATADORES (para exibição) =====

export function formatCNPJ(cnpj: string): string {
  const nums = unmaskNumber(cnpj);
  if (nums.length !== 14) return cnpj;
  return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5, 8)}/${nums.slice(8, 12)}-${nums.slice(12)}`;
}

export function formatTelefone(tel: string): string {
  const nums = unmaskNumber(tel);
  if (nums.length === 11) {
    return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
  }
  if (nums.length === 10) {
    return `(${nums.slice(0, 2)}) ${nums.slice(2, 6)}-${nums.slice(6)}`;
  }
  return tel;
}

export function formatMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

// ===== VALIDAÇÃO DE CNPJ =====

/**
 * Valida CNPJ com dígitos verificadores
 */
export function validarCNPJ(cnpj: string): boolean {
  const nums = unmaskNumber(cnpj);
  if (nums.length !== 14) return false;

  // Rejeitar CNPJs com todos os dígitos iguais
  if (/^(\d)\1{13}$/.test(nums)) return false;

  // Primeiro dígito verificador
  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let soma = 0;
  for (let i = 0; i < 12; i++) {
    soma += parseInt(nums[i], 10) * pesos1[i];
  }
  let resto = soma % 11;
  const dig1 = resto < 2 ? 0 : 11 - resto;
  if (parseInt(nums[12], 10) !== dig1) return false;

  // Segundo dígito verificador
  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  soma = 0;
  for (let i = 0; i < 13; i++) {
    soma += parseInt(nums[i], 10) * pesos2[i];
  }
  resto = soma % 11;
  const dig2 = resto < 2 ? 0 : 11 - resto;
  if (parseInt(nums[13], 10) !== dig2) return false;

  return true;
}
