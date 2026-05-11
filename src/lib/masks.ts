// Utilitários de máscara e validação para campos de formulário

export function maskCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function unmaskCPF(value: string): string {
  return value.replace(/\D/g, '');
}

export function isValidCPF(cpf: string): boolean {
  const digits = unmaskCPF(cpf);
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(digits[10])) return false;

  return true;
}

export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3');
  }
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

export function unmaskPhone(value: string): string {
  return value.replace(/\D/g, '');
}

export function isValidPhone(phone: string): boolean {
  const digits = unmaskPhone(phone);
  return digits.length === 10 || digits.length === 11;
}

export function maskCEP(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return digits.replace(/(\d{5})(\d)/, '$1-$2');
}

export function unmaskCEP(value: string): string {
  return value.replace(/\D/g, '');
}

export function isValidCEP(cep: string): boolean {
  return unmaskCEP(cep).length === 8;
}

export function maskNumber(value: string, maxLength?: number): string {
  let digits = value.replace(/\D/g, '');
  if (maxLength) digits = digits.slice(0, maxLength);
  return digits;
}

// Capitaliza a primeira letra de cada palavra (ex: "david lucas" → "David Lucas")
export function capitalizeWords(value: string): string {
  if (!value) return value;
  return value
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, char => char.toUpperCase());
}

// Capitaliza apenas a primeira letra da string (ex: "descrição" → "Descrição")
export function capitalizeFirst(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

// Formata data para input type="date" (YYYY-MM-DD)
// Recebe string do banco (pode vir com timezone) e extrai só a parte da data
export function formatDateForInput(value: string | null | undefined): string {
  if (!value) return '';
  // Se vier com timezone (ex: 1990-05-10T00:00:00+00:00), pega só YYYY-MM-DD
  const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : '';
}
