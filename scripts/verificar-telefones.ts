/**
 * Script para verificar telefones inválidos no banco de dados
 * Executa: npx tsx scripts/verificar-telefones.ts
 */
import { config } from 'dotenv';
import { resolve } from 'path';
import postgres from 'postgres';

config({ path: resolve(process.cwd(), '.env') });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não encontrada no .env');
  process.exit(1);
}

// Função de validação (mesma lógica do frontend)
function unmaskPhone(value: string): string {
  return value.replace(/\D/g, '');
}

function isValidPhone(phone: string): boolean {
  const digits = unmaskPhone(phone);
  if (digits.length !== 11) return false;
  const ddd = parseInt(digits.slice(0, 2), 10);
  const nonoDigito = digits[2];
  return ddd >= 11 && ddd <= 99 && nonoDigito === '9';
}

function getIssue(phone: string): string {
  const digits = unmaskPhone(phone);
  if (!digits) return 'Vazio';
  if (digits.length < 10) return 'Muito curto (sem DDD)';
  if (digits.length === 10) return 'Fixo/antigo (sem o 9)';
  if (digits.length === 11) {
    const ddd = parseInt(digits.slice(0, 2), 10);
    const nono = digits[2];
    if (ddd < 11 || ddd > 99) return 'DDD inválido';
    if (nono !== '9') return 'Sem o 9 (nono dígito)';
  }
  if (digits.length > 11) {
    // Remove 55 e reavalia
    const without55 = digits.startsWith('55') ? digits.slice(2) : digits;
    if (without55.length === 11) {
      const ddd = parseInt(without55.slice(0, 2), 10);
      const nono = without55[2];
      if (ddd >= 11 && ddd <= 99 && nono === '9') return 'Com 55 (válido mas com prefixo)';
    }
    return 'Muito longo';
  }
  return 'Formato desconhecido';
}

async function main() {
  const sql = postgres(DATABASE_URL, { ssl: 'require' });

  console.log('🔍 Verificando telefones no banco...\n');

  const eleitores = await sql`
    SELECT id, nome, telefone, cidade, bairro
    FROM eleitores
    WHERE telefone IS NOT NULL AND telefone != ''
    ORDER BY nome
  `;

  const invalidos = eleitores.filter(e => !isValidPhone(e.telefone));
  const validos = eleitores.filter(e => isValidPhone(e.telefone));

  console.log(`📊 Total de eleitores com telefone: ${eleitores.length}`);
 console.log(`✅ Válidos: ${validos.length}`);
  console.log(`❌ Inválidos: ${invalidos.length}\n`);

  if (invalidos.length === 0) {
    console.log('🎉 Todos os telefones estão no formato correto!');
    await sql.end();
    return;
  }

  // Agrupa por problema
  const porProblema = new Map<string, typeof invalidos>();
  for (const e of invalidos) {
    const issue = getIssue(e.telefone);
    if (!porProblema.has(issue)) porProblema.set(issue, []);
    porProblema.get(issue)!.push(e);
  }

  console.log('📋 RESUMO POR PROBLEMA:');
  console.log('─'.repeat(50));
  for (const [problema, lista] of porProblema) {
    console.log(`  ${problema}: ${lista.length}`);
  }
  console.log('');

  console.log('📋 LISTA DETALHADA (primeiros 50):');
  console.log('─'.repeat(100));
  console.log(`${'NOME'.padEnd(30)} ${'TELEFONE'.padEnd(20)} ${'PROBLEMA'.padEnd(25)} ${'CIDADE'}`);
  console.log('─'.repeat(100));

  for (const e of invalidos.slice(0, 50)) {
    const nome = (e.nome || '').slice(0, 28).padEnd(30);
    const tel = (e.telefone || '').padEnd(20);
    const prob = getIssue(e.telefone).padEnd(25);
    const cid = e.cidade || '';
    console.log(`${nome} ${tel} ${prob} ${cid}`);
  }

  if (invalidos.length > 50) {
    console.log(`\n... e mais ${invalidos.length - 50} registros`);
  }

  console.log('\n');
  console.log('💡 SQL para corrigir casos comuns:');
  console.log('');

  // Caso: sem o 9 (10 dígitos → 11)
  const semNove = invalidos.filter(e => unmaskPhone(e.telefone).length === 10);
  if (semNove.length > 0) {
    console.log(`-- ${semNove.length} telefones sem o 9 (ex: 1187654321 → 11987654321):`);
    console.log(`-- UPDATE eleitores SET telefone = regexp_replace(telefone, '(^\\D*\\d{2}\\D*)', '\\19') WHERE id IN (...);`);
    console.log('');
  }

  // Caso: com 55 no início
  const com55 = invalidos.filter(e => {
    const d = unmaskPhone(e.telefone);
    return d.startsWith('55') && d.length === 13;
  });
  if (com55.length > 0) {
    console.log(`-- ${com55.length} telefones com 55 no início:`);
    console.log(`-- UPDATE eleitores SET telefone = SUBSTRING(telefone FROM 3) WHERE id IN (...);`);
    console.log('');
  }

  // Caso: muito curto (sem DDD)
  const semDDD = invalidos.filter(e => {
    const d = unmaskPhone(e.telefone);
    return d.length > 0 && d.length < 10;
  });
  if (semDDD.length > 0) {
    console.log(`-- ${semDDD.length} telefones sem DDD — precisam ser corrigidos manualmente`);
    console.log('');
  }

  console.log('─'.repeat(100));
  console.log('\n⚠️  Recomendação: revise a lista e corrija manualmente no sistema.');
  console.log('   O cadastro agora exige formato: (DD) 98765-4321\n');

  await sql.end();
}

main().catch(e => {
  console.error('Erro:', e);
  process.exit(1);
});
