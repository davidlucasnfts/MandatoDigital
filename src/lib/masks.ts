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

/**
 * Formata telefone brasileiro para exibição: (DD) 9XXXX-XXXX
 * Sempre exige 11 dígitos (DDD + 9 + número) para WhatsApp.
 * Aceita entrada com ou sem o 55 inicial — remove o 55 se presente.
 */
export function maskPhone(value: string): string {
  let digits = value.replace(/\D/g, '');
  // Remove 55 do início se o usuário colar número com prefixo do país
  if (digits.startsWith('55') && digits.length > 11) {
    digits = digits.slice(2);
  }
  digits = digits.slice(0, 11);
  // Só formata se tiver pelo menos o DDD (2 dígitos)
  if (digits.length <= 2) return digits;
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

export function unmaskPhone(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Valida se o telefone está no formato correto para WhatsApp:
 * - 11 dígitos (DDD + 9 + 8 dígitos)
 * - DDD entre 11 e 99
 * - Começa com 9 (nono dígito)
 */
export function isValidPhone(phone: string): boolean {
  const digits = unmaskPhone(phone);
  if (digits.length !== 11) return false;
  const ddd = parseInt(digits.slice(0, 2), 10);
  const nonoDigito = digits[2];
  return ddd >= 11 && ddd <= 99 && nonoDigito === '9';
}

/**
 * Normaliza telefone para o formato WAHA API:
 * - Remove máscara
 * - Remove 55 se já existir
 * - Adiciona 55 no início
 * - Retorna: 55<DDD><9><número> (13 dígitos)
 */
export function normalizePhoneForWhatsApp(phone: string): string {
  let digits = unmaskPhone(phone);
  // Remove 55 do início se existir
  if (digits.startsWith('55')) {
    digits = digits.slice(2);
  }
  // Adiciona 55
  return '55' + digits;
}

/**
 * Converte telefone para chatId do WhatsApp (formato WAHA)
 * Ex: (11) 98765-4321 → 5511987654321@c.us
 */
export function toWhatsAppChatId(phone: string): string {
  return normalizePhoneForWhatsApp(phone) + '@c.us';
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
export function formatDateForInput(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  // Se vier com timezone (ex: 1990-05-10T00:00:00+00:00), pega só YYYY-MM-DD
  const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : undefined;
}
