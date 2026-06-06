/**
 * Script para gerar PDF de Análise de Custos — Mandato Digital
 * Usa jsPDF + jspdf-autotable (já no package.json)
 * 
 * Executar: npx tsx scripts/gerar-analise-custos.ts
 */

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { existsSync, mkdirSync } from "fs";
import { dirname } from "path";

const OUTPUT_PATH = "docs/analise-custos-mandato-digital.pdf";

// Cores do tema
const AZUL = "#2563eb";
const VERDE = "#16a34a";
const VERMELHO = "#dc2626";
const AMARELO = "#ca8a04";
const CINZA = "#64748b";
const CINZA_ESCURO = "#1e293b";
const BRANCO = "#ffffff";
const FUNDO = "#f8fafc";

function criarPDF(): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  doc.setProperties({
    title: "Análise de Custos — Mandato Digital",
    subject: "Análise completa de custos e projeções",
    author: "Kimi Code",
    creator: "Mandato Digital",
  });
  return doc;
}

function addHeader(doc: jsPDF, titulo: string, y: number): number {
  doc.setFillColor(AZUL);
  doc.rect(0, y - 6, 210, 10, "F");
  doc.setTextColor(BRANCO);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(titulo, 10, y);
  doc.setTextColor(CINZA_ESCURO);
  doc.setFont("helvetica", "normal");
  return y + 8;
}

function addText(doc: jsPDF, texto: string, y: number, options?: { bold?: boolean; size?: number; color?: string }): number {
  const size = options?.size || 10;
  doc.setFontSize(size);
  doc.setFont("helvetica", options?.bold ? "bold" : "normal");
  doc.setTextColor(options?.color || CINZA_ESCURO);
  const lines = doc.splitTextToSize(texto, 190);
  doc.text(lines, 10, y);
  return y + lines.length * (size * 0.4);
}

function addBox(doc: jsPDF, y: number, titulo: string, conteudo: string[], cor: string = AZUL): number {
  const startY = y;
  doc.setFillColor(cor);
  doc.roundedRect(10, y, 190, 8, 2, 2, "F");
  doc.setTextColor(BRANCO);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(titulo, 14, y + 5.5);

  y += 10;
  doc.setTextColor(CINZA_ESCURO);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  for (const linha of conteudo) {
    const lines = doc.splitTextToSize(linha, 186);
    doc.text(lines, 14, y);
    y += lines.length * 3.8;
  }
  return y + 2;
}

function addPage(doc: jsPDF, numero: number): number {
  doc.addPage();
  doc.setFillColor(FUNDO);
  doc.rect(0, 0, 210, 297, "F");
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(CINZA);
  doc.text(`Mandato Digital — Análise de Custos | Página ${numero}`, 105, 292, { align: "center" });
  return 15;
}

// ===================== CAPA =====================
const doc = criarPDF();
doc.setFillColor(FUNDO);
doc.rect(0, 0, 210, 297, "F");

// Barra superior
doc.setFillColor(AZUL);
doc.rect(0, 0, 210, 60, "F");

doc.setTextColor(BRANCO);
doc.setFontSize(28);
doc.setFont("helvetica", "bold");
doc.text("ANÁLISE DE CUSTOS", 105, 35, { align: "center" });
doc.setFontSize(16);
doc.setFont("helvetica", "normal");
doc.text("Mandato Digital", 105, 48, { align: "center" });

// Subtítulo
doc.setTextColor(CINZA);
doc.setFontSize(11);
doc.text("Análise completa de infraestrutura, serviços e projeções de crescimento", 105, 75, { align: "center" });

// Data
doc.setTextColor(CINZA_ESCURO);
doc.setFontSize(10);
doc.text(`Gerado em: 06/06/2026`, 105, 85, { align: "center" });

// Resumo executivo na capa
doc.setFillColor(BRANCO);
doc.roundedRect(15, 100, 180, 70, 4, 4, "F");
doc.setDrawColor(AZUL);
doc.setLineWidth(0.5);
doc.roundedRect(15, 100, 180, 70, 4, 4, "S");

doc.setTextColor(AZUL);
doc.setFontSize(12);
doc.setFont("helvetica", "bold");
doc.text("RESUMO EXECUTIVO", 20, 110);

doc.setTextColor(CINZA_ESCURO);
doc.setFontSize(9);
doc.setFont("helvetica", "normal");
const resumo = [
  "• Custo mensal atual: ~R$ 40 (VPS HostUp)",
  "• Serviços em free tier: Supabase, Vercel, Here API, WAHA",
  "• 14 decisões pendentes identificadas com opções de mercado",
  "• Projeção 12 meses (10 clientes): ~R$ 655/mês",
  "• Maior gatilho de custo: WhatsApp multi-cliente",
  "• Maior economia: CNEFE próprio (evita R$ 500-2000/mês em geocodificação)",
];
let y = 118;
for (const linha of resumo) {
  doc.text(linha, 20, y);
  y += 5;
}

// Stack atual
doc.setTextColor(AZUL);
doc.setFontSize(12);
doc.setFont("helvetica", "bold");
doc.text("STACK ATUAL", 20, 185);

const stackItems = [
  ["Frontend", "React 19 + TypeScript + Tailwind + shadcn/ui + Vite"],
  ["Backend", "tRPC + Hono + Drizzle ORM + Zod"],
  ["Banco", "PostgreSQL (Supabase) — 7 tabelas, ~20MB"],
  ["Auth", "Supabase Auth (JWT + OAuth)"],
  ["Deploy", "Vercel (serverless) + VPS HostUp (CNEFE + WAHA)"],
  ["Mapas", "Leaflet + OpenStreetMap/CartoDB (grátis)"],
  ["WhatsApp", "WAHA API CORE (1 sessão, grátis)"],
  ["Geocodificação", "CNEFE próprio + Here API fallback (30k/mês grátis)"],
];

autoTable(doc, {
  startY: 190,
  head: [["Camada", "Tecnologia"]],
  body: stackItems,
  theme: "grid",
  headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
  bodyStyles: { fontSize: 9, textColor: 30 },
  columnStyles: { 0: { fontStyle: "bold", cellWidth: 40 } },
  margin: { left: 15, right: 15 },
});

// ===================== PÁGINA 2: INFRAESTRUTURA ATUAL =====================
let pageNum = 2;
y = addPage(doc, pageNum);
y = addHeader(doc, "1. INFRAESTRUTURA ATUAL — CUSTO DETALHADO", y);

y = addText(doc, "Esta seção detalha cada serviço/infraestrutura em uso, seu custo atual, modelo de cobrança e gatilhos de upgrade.", y, { size: 9 });
y += 3;

// Tabela de custos atual
autoTable(doc, {
  startY: y,
  head: [["Serviço", "Plano Atual", "Custo/mês", "Modelo", "Gatilho de Upgrade"]],
  body: [
    ["Vercel (Deploy)", "Hobby (Free)", "R$ 0", "Fixo", "100GB bandwidth, 1k builds/mês, 10s funções"],
    ["Supabase (Banco)", "Free Tier", "R$ 0", "Fixo", "500MB DB, 1GB storage, 2GB egress, 30 conexões"],
    ["VPS HostUp", "2 CPU / 3.8GB RAM", "~R$ 40", "Fixo", "RAM insuficiente, disco cheio"],
    ["Here API", "Freemium", "R$ 0", "Por uso", "30k requisições/mês"],
    ["WAHA WhatsApp", "CORE (Free)", "R$ 0", "Fixo", "Só 1 sessão — não suporta multi-cliente"],
    ["Leaflet/OpenStreetMap", "Open Source", "R$ 0", "Grátis", "Nenhum"],
    ["CNEFE (IBGE)", "Dados públicos", "R$ 0", "Grátis", "Nenhum"],
    ["Dependências npm", "Todas MIT/Apache", "R$ 0", "Grátis", "Nenhum"],
  ],
  theme: "grid",
  headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
  bodyStyles: { fontSize: 8.5, textColor: 30 },
  columnStyles: {
    0: { fontStyle: "bold", cellWidth: 45 },
    2: { cellWidth: 25, halign: "center" },
  },
  margin: { left: 10, right: 10 },
});

y = (doc as any).lastAutoTable.finalY + 8;

// Detalhamento por serviço
y = addHeader(doc, "1.1 Vercel — Deploy Frontend + API Serverless", y);
y = addBox(doc, y, "POR QUE TEMOS", [
  "O Vercel hospeda o frontend React e as funções serverless do backend (tRPC/Hono).",
  "O plano Hobby é generoso para um SaaS em fase inicial com poucos usuários.",
], AZUL);

y = addBox(doc, y, "GATILHOS DE UPGRADE", [
  "• Builds excedendo 1.000/mês (muito improvável no curto prazo)",
  "• Funções excedendo 10s (possível com relatórios pesados ou importações CSV grandes)",
  "• Bandwidth acima de 100GB/mês (só com muitos usuários ativos)",
  "• Quando tiver 10+ clientes ativos com uso intenso → upgrade para Pro ($20/mês ≈ R$ 110)",
], AMARELO);

y = addBox(doc, y, "RECOMENDAÇÃO", [
  "Manter no Hobby o máximo possível. Otimizar builds (evitar builds desnecessários).",
  "Se funções estourarem 10s, quebrar em jobs menores ou usar streaming.",
], VERDE);

// ===================== PÁGINA 3: SUPABASE + VPS =====================
pageNum++;
y = addPage(doc, pageNum);
y = addHeader(doc, "1.2 Supabase — Banco de Dados PostgreSQL", y);

y = addBox(doc, y, "POR QUE TEMOS", [
  "Auth pronto com OAuth, email/senha, magic links. RLS nativo para segurança.",
  "Storage com políticas de acesso. Real-time subscriptions.",
  "PostgreSQL padrão — sem vendor lock-in, migração possível.",
  "7 tabelas atuais: comunidades, eleitores, solicitações, tarefas, eventos, documentos, comunicações.",
], AZUL);

y = addBox(doc, y, "GATILHOS DE UPGRADE", [
  "• Banco: 500MB → com 10.000 eleitores + fotos + documentos ≈ 500MB",
  "• Storage: 1GB → se implementar upload de fotos/documentos esgota rápido",
  "• Egress: 2GB/mês → 2GB = ~1.000-4.000 pageviews/mês",
  "• Conexões: 30 → com 10 usuários simultâneos ativos pode estourar",
  "• Upgrade Pro: $25/mês ≈ R$ 135 (8GB DB, 100GB storage, 50GB egress, 80 conexões)",
], AMARELO);

autoTable(doc, {
  startY: y,
  head: [["Clientes", "Eleitores", "Tamanho BD", "Plano Necessário", "Custo"]],
  body: [
    ["1 (hoje)", "~500", "~20MB", "Free", "R$ 0"],
    ["5", "~5.000", "~200MB", "Free", "R$ 0"],
    ["10", "~15.000", "~600MB", "Pro", "R$ 135/mês"],
    ["25", "~50.000", "~2GB", "Pro/Team", "R$ 135-325/mês"],
    ["50", "~150.000", "~6GB", "Team+", "R$ 325+/mês"],
  ],
  theme: "grid",
  headStyles: { fillColor: [37, 99, 235], textColor: 255 },
  bodyStyles: { fontSize: 9 },
  margin: { left: 10, right: 10 },
});

y = (doc as any).lastAutoTable.finalY + 8;

y = addHeader(doc, "1.3 VPS HostUp — CNEFE + WAHA WhatsApp", y);
y = addBox(doc, y, "POR QUE TEMOS", [
  "API Proxy CNEFE: Banco PostgreSQL com 100M+ endereços do Brasil (geocodificação própria, custo zero).",
  "WAHA API CORE: WhatsApp Web automatizado, 1 sessão apenas.",
  "Ter CNEFE próprio evita pagar por geocodificação (Here API paga, Google Maps).",
  "Economia estimada: R$ 500-2.000/mês se usássemos API paga de geocodificação.",
], AZUL);

y = addBox(doc, y, "GATILHOS DE UPGRADE NA VPS", [
  "• RAM insuficiente para WAHA + CNEFE → upgrade 4-8GB RAM (+R$ 20-40/mês)",
  "• Múltiplos clientes WhatsApp → 1 VPS por cliente OU Evolution API",
  "• Disco cheio (CNEFE é grande) → upgrade de SSD (+R$ 10-20/mês)",
], AMARELO);

y = addBox(doc, y, "RECOMENDAÇÃO", [
  "Manter VPS atual para 1 cliente. Avaliar upgrade de RAM se WAHA ficar lento.",
  "Para multi-cliente WhatsApp: migrar para serviço cloud (WasenderAPI/Wappfly) em vez de 1 VPS/cliente.",
], VERDE);

// ===================== PÁGINA 4: DECISÕES PENDENTES =====================
pageNum++;
y = addPage(doc, pageNum);
y = addHeader(doc, "2. DECISÕES PENDENTES / STANDBY — OPÇÕES DE MERCADO", y);

y = addText(doc, "Foram identificadas 14 decisões arquiteturais ou funcionalidades deixadas em standby. Para cada uma, apresentamos as opções de mercado com análise de economia e segurança.", y, { size: 9 });
y += 5;

// Decisão 1: WhatsApp
y = addHeader(doc, "2.1 WhatsApp API — Multi-cliente (Análise Aprofundada)", y);
y = addBox(doc, y, "STATUS", ["Proposto em ADR-006. Aguardando decisão. WAHA CORE suporta apenas 1 sessão. Cada cliente precisa de sessão WhatsApp isolada."], CINZA);

y = addText(doc, "OPÇÃO A: 1 VPS por Cliente (WAHA)", y, { bold: true, size: 10, color: CINZA_ESCURO });
y += 4;
y = addBox(doc, y, "FUNCIONAMENTO", [
  "Cada vereador tem sua própria VPS com WAHA CORE rodando.",
  "VPS 2 CPU / 4GB RAM / Ubuntu = R$ 30-50/mês cada.",
  "Isolamento total: se uma VPS cai, não afeta os outros.",
  "Manutenção: atualizar N servidores individualmente.",
], CINZA);

y = addBox(doc, y, "PRÓS", [
  "Isolamento total — um cliente não vê o WhatsApp do outro.",
  "Simples de entender: 1 cliente = 1 servidor.",
  "Se cai 1 VPS, só 1 cliente fica sem WhatsApp.",
], VERDE);

y = addBox(doc, y, "CONTRAS", [
  "Custo cresce linearmente: 10 clientes = R$ 300-500/mês só em VPS.",
  "Manutenção distribuída: atualizar Docker, sistema, WAHA em N servidores.",
  "Gerenciamento complexo: N IPs, N dominios, N certificados SSL.",
  "Escalabilidade ruim: cada novo cliente = nova infraestrutura.",
], VERMELHO);

y = addText(doc, "OPÇÃO B: Evolution API — 1 VPS Maior", y, { bold: true, size: 10, color: CINZA_ESCURO });
y += 4;
y = addBox(doc, y, "FUNCIONAMENTO", [
  "Uma VPS maior (4-8GB RAM) roda Evolution API + PostgreSQL + Redis.",
  "Cada cliente tem uma 'instância' isolada dentro da mesma API.",
  "Token separado por instância = isolamento lógico.",
  "Custo: R$ 50-100/mês para a VPS (independente de quantos clientes).",
], CINZA);

y = addBox(doc, y, "PRÓS", [
  "Custo fixo: R$ 50-100/mês para quantos clientes couberem na RAM.",
  "Uma infraestrutura só para gerenciar.",
  "Suporta ~50 clientes na mesma VPS (dependendo da RAM).",
  "Open source — não depende de terceiro.",
], VERDE);

y = addBox(doc, y, "CONTRAS", [
  "Setup complexo: PostgreSQL + Redis + Node.js + Evolution API.",
  "Manutenção alta: banco, cache, atualizações de segurança.",
  "Ponto único de falha: se a VPS cai, TODOS os clientes ficam sem WhatsApp.",
  "Requer expertise em Linux/Docker para manter.",
  "Não é isolamento físico — é lógico (token).",
], VERMELHO);

y = addText(doc, "OPÇÃO C: Serviço Cloud (WasenderAPI / Wappfly / Whapi)", y, { bold: true, size: 10, color: CINZA_ESCURO });
y += 4;
y = addBox(doc, y, "FUNCIONAMENTO", [
  "Você não gerencia servidor NENHUM.",
  "Cada cliente conecta seu WhatsApp via QR Code no painel do serviço.",
  "Seu sistema manda mensagens via API REST (HTTP POST) para o serviço.",
  "O serviço gerencia sessões, reconexões, atualizações do WhatsApp Web.",
], CINZA);

autoTable(doc, {
  startY: y,
  head: [["Serviço", "Preço/número", "Preço 10 clientes", "Setup", "Manutenção", "Recomendação"]],
  body: [
    ["WasenderAPI", "$6/mês ≈ R$ 33", "R$ 330/mês", "5 minutos", "Zero", "Melhor custo-benefício"],
    ["Wappfly", "$7/mês ≈ R$ 38", "R$ 385/mês", "5 minutos", "Zero", "Alternativa sólida"],
    ["Whapi.Cloud", "$5-10/mês", "R$ 250-500/mês", "5 minutos", "Zero", "Opção econômica"],
    ["Z-API", "R$ 49/mês", "R$ 490/mês", "5 minutos", "Zero", "Brasileiro, suporte local"],
  ],
  theme: "grid",
  headStyles: { fillColor: [37, 99, 235], textColor: 255 },
  bodyStyles: { fontSize: 8.5 },
  margin: { left: 10, right: 10 },
});

y = (doc as any).lastAutoTable.finalY + 5;

y = addBox(doc, y, "PRÓS", [
  "Zero infraestrutura: sem VPS, sem Docker, sem servidor.",
  "Setup em 5 minutos: QR Code + token API.",
  "Escalabilidade ilimitada: 1 ou 1000 clientes, mesma integração.",
  "Manutenção zero: o serviço atualiza o WhatsApp Web automaticamente.",
  "Custo previsível: R$ 33-38/mês por cliente (fixo).",
], VERDE);

y = addBox(doc, y, "CONTRAS", [
  "Dependência de terceiro: se o serviço fecha, você perde todos os clientes.",
  "Dados passam por servidor externo (mas mensagens são criptografadas pelo WhatsApp).",
  "Margem menor: R$ 33/mês de custo em um plano de R$ 249 = 13% só de WhatsApp.",
], VERMELHO);

y = addText(doc, "OPÇÃO D: WhatsApp Business API Oficial (Meta)", y, { bold: true, size: 10, color: CINZA_ESCURO });
y += 4;
y = addBox(doc, y, "FUNCIONAMENTO", [
  "API oficial do WhatsApp (Meta/Facebook).",
  "Requer aprovação do Facebook Business.",
  "Mensagens template pré-aprovadas para iniciar conversa.",
  "Cobrança por conversa (não por mensagem).",
], CINZA);

y = addBox(doc, y, "PRÓS", [
  "Oficial do WhatsApp: não quebra, não é banido.",
  "Green checkmark (selo verde) para empresas verificadas.",
  "Mensagens ilimitadas dentro da janela de 24h.",
], VERDE);

y = addBox(doc, y, "CONTRAS", [
  "Custo alto: ~US$ 0.005-0.08 por conversa (depende do país).",
  "Processo burocrático: aprovação do Facebook, verificação de empresa.",
  "Não funciona com número pessoal: precisa de número de empresa.",
  "Restrições: só pode iniciar com template aprovado.",
  "Overkill para vereadores: eles usam número pessoal, não empresa.",
], VERMELHO);

y = addHeader(doc, "COMPARATIVO FINAL — WhatsApp Multi-cliente", y);

autoTable(doc, {
  startY: y,
  head: [["Critério", "1 VPS/cliente", "Evolution API", "Cloud (Wasender)", "Oficial Meta"]],
  body: [
    ["Custo 10 clientes", "R$ 300-500", "R$ 50-100", "R$ 330", "R$ 200-800*"],
    ["Setup", "Médio", "Complexo", "Simples", "Burocrático"],
    ["Manutenção", "Média", "Alta", "Zero", "Baixa"],
    ["Isolamento", "Total (físico)", "Lógico (token)", "Total (cloud)", "Total (oficial)"],
    ["Escalabilidade", "Ruim (linear)", "Boa (~50)", "Ilimitada", "Ilimitada"],
    ["Risco", "Médio (N servidores)", "Alto (ponto único)", "Médio (terceiro)", "Baixo (oficial)"],
    ["Número pessoal", "✅ Sim", "✅ Sim", "✅ Sim", "❌ Não"],
  ],
  theme: "grid",
  headStyles: { fillColor: [37, 99, 235], textColor: 255 },
  bodyStyles: { fontSize: 8 },
  margin: { left: 10, right: 10 },
});

y = (doc as any).lastAutoTable.finalY + 5;

y = addBox(doc, y, "RECOMENDAÇÃO DO KIMI", [
  "FASE 1 (agora — 1 cliente): Manter WAHA na VPS atual. Custo zero. Funciona.",
  "",
  "FASE 2 (2-10 clientes): Migrar para WasenderAPI ou Wappfly.",
  "  • Motivo: setup em 5 minutos, zero manutenção, custo previsível.",
  "  • Risco mitigado: testar com 1 cliente primeiro, manter WAHA como fallback.",
  "  • Implementação: trocar a URL da API dinamicamente por cliente no banco.",
  "",
  "FASE 3 (10+ clientes): Reavaliar.",
  "  • Se margem for alta (>70%) → continuar com cloud (simplicidade vale o custo).",
  "  • Se margem for apertada (<50%) → migrar para Evolution API em VPS dedicada.",
  "  • NUNCA 1 VPS por cliente: custo linear não escala para SaaS.",
  "",
  "OPÇÃO META OFICIAL: Descartada para este projeto.",
  "  • Vereadores usam número pessoal, não empresa.",
  "  • Custo por conversa é imprevisível (depende do volume de mensagens).",
  "  • Burocracia do Facebook não faz sentido para políticos locais.",
], VERDE);

// Decisão 2: Geocodificação
pageNum++;
y = addPage(doc, pageNum);
y = addHeader(doc, "2.2 Geocodificação — Estratégia CNEFE", y);
y = addBox(doc, y, "STATUS", ["Documentado em docs/decisao-cnefe-mapa.md. Aguardando decisão do David."], CINZA);

autoTable(doc, {
  startY: y,
  head: [["Opção", "Precisão", "Custo", "Espaço", "Velocidade", "Cobertura"]],
  body: [
    ["CNEFE 1-2 estados", "⭐⭐⭐⭐⭐", "Grátis", "~50-300 MB", "Instantâneo", "Estado importado"],
    ["Nominatim (atual)", "⭐⭐⭐", "Grátis", "0", "1 req/s", "Todo Brasil"],
    ["Cache inteligente", "⭐⭐⭐⭐", "Grátis", "~10-100 MB", "Rápido", "Todo Brasil"],
    ["ViaCEP + CEP", "⭐⭐⭐", "Grátis", "~10 MB", "Instantâneo", "Todo Brasil"],
    ["Upgrade Supabase Pro", "⭐⭐⭐⭐⭐", "$25/mês", "1,2 GB", "Instantâneo", "Todo Brasil"],
  ],
  theme: "grid",
  headStyles: { fillColor: [37, 99, 235], textColor: 255 },
  bodyStyles: { fontSize: 9 },
  margin: { left: 10, right: 10 },
});

y = (doc as any).lastAutoTable.finalY + 5;
y = addBox(doc, y, "RECOMENDAÇÃO", [
  "Híbrido: Importar CNEFE da UF principal do mandato (~15-300 MB).",
  "Para outros estados: cache inteligente + Nominatim fallback.",
  "Resultado: 80% dos eleitores com geocodificação instantânea e precisa, sem custo.",
], VERDE);

// Decisão 3: E-mail
y = addHeader(doc, "2.3 E-mail — Envio de Campanhas", y);
y = addBox(doc, y, "STATUS", ["Código preparado (tipo 'email' no schema), mas não implementado no backend. UI mostra opção removida."], CINZA);

autoTable(doc, {
  startY: y,
  head: [["Opção", "Custo", "Limite Free", "Setup", "Segurança", "Recomendação"]],
  body: [
    ["Resend", "$0.0001/email", "100 emails/dia", "Simples", "Alta (DKIM/SPF)", "RECOMENDADO"],
    ["SendGrid", "$0.0001/email", "100 emails/dia", "Médio", "Alta", "Boa alternativa"],
    ["Brevo (ex-Sendinblue)", "Grátis", "300 emails/dia", "Simples", "Média", "Mais generoso no free"],
    ["AWS SES", "$0.0001/email", "Nenhum", "Complexo", "Alta", "Só se já usa AWS"],
  ],
  theme: "grid",
  headStyles: { fillColor: [37, 99, 235], textColor: 255 },
  bodyStyles: { fontSize: 9 },
  margin: { left: 10, right: 10 },
});

y = (doc as any).lastAutoTable.finalY + 5;
y = addBox(doc, y, "RECOMENDAÇÃO", [
  "Resend: API moderna, documentação excelente, preço competitivo.",
  "Brevo: Free tier mais generoso (300/dia) — bom para começar sem custo.",
  "Implementar quando campanhas de e-mail forem prioridade.",
], VERDE);

// ===================== PÁGINA 5: MAIS DECISÕES =====================
pageNum++;
y = addPage(doc, pageNum);
y = addHeader(doc, "2.4 PWA / App Mobile", y);
y = addBox(doc, y, "STATUS", ["Mencionado na landing page ('instalar como app no celular'), mas não implementado."], CINZA);

autoTable(doc, {
  startY: y,
  head: [["Opção", "Custo", "Esforço", "Performance", "Recomendação"]],
  body: [
    ["PWA (Vite PWA plugin)", "R$ 0", "Baixo (1-2 dias)", "Boa", "RECOMENDADO — mesmo código"],
    ["React Native", "R$ 0", "Alto (semanas)", "Nativa", "Só se precisar de recursos nativos"],
    ["Flutter", "R$ 0", "Alto (semanas)", "Nativa", "Overkill para o momento"],
  ],
  theme: "grid",
  headStyles: { fillColor: [37, 99, 235], textColor: 255 },
  bodyStyles: { fontSize: 9 },
  margin: { left: 10, right: 10 },
});

y = (doc as any).lastAutoTable.finalY + 5;
y = addBox(doc, y, "RECOMENDAÇÃO", ["PWA com Vite PWA plugin: instalação em 1-2 dias, mesmo código React, funciona offline, notificações push. Zero custo adicional."], VERDE);

y = addHeader(doc, "2.6 Backup — Estratégia de Dados", y);
y = addBox(doc, y, "STATUS", ["Backup automático só no Supabase Pro. Atualmente sem backup automatizado."], CINZA);

autoTable(doc, {
  startY: y,
  head: [["Opção", "Custo", "Frequência", "Recuperação", "Recomendação"]],
  body: [
    ["Supabase Pro PITR", "$25/mês", "Contínuo", "Ponto-em-tempo", "Melhor, mas custa"],
    ["pg_dump manual", "R$ 0", "Semanal", "Último dump", "Risco de esquecer"],
    ["AWS S3 + pg_dump", "~R$ 5-10/mês", "Diário (cron)", "Último backup", "RECOMENDADO"],
    ["Cloudflare R2", "~R$ 2-5/mês", "Diário (cron)", "Último backup", "Mais barato que S3"],
  ],
  theme: "grid",
  headStyles: { fillColor: [37, 99, 235], textColor: 255 },
  bodyStyles: { fontSize: 9 },
  margin: { left: 10, right: 10 },
});

y = (doc as any).lastAutoTable.finalY + 5;
y = addBox(doc, y, "RECOMENDAÇÃO", ["Cloudflare R2 + script pg_dump diário na VPS: mais barato que S3, sem egress fees. Custo ~R$ 2-5/mês. Implementar antes de ter clientes pagantes."], VERDE);

// ===================== PÁGINA 6: MAIS DECISÕES + PROJEÇÃO =====================
pageNum++;
y = addPage(doc, pageNum);
y = addHeader(doc, "2.7 Rate Limiting — Hono vs Redis", y);
y = addBox(doc, y, "STATUS", ["Atual: hono-rate-limiter in-memory. Funciona para 1 instância (Vercel serverless = múltiplas instâncias)."], CINZA);

autoTable(doc, {
  startY: y,
  head: [["Opção", "Custo", "Escalabilidade", "Precisão", "Recomendação"]],
  body: [
    ["Hono in-memory", "R$ 0", "Ruim (por instância)", "Baixa", "Só para dev/teste"],
    ["Upstash Redis", "~$10-30/mês", "Excelente", "Alta", "RECOMENDADO para produção"],
    ["Redis Cloud", "~$15-40/mês", "Excelente", "Alta", "Alternativa"],
    ["Supabase Rate Limit", "Incluso no Pro", "Boa", "Média", "Se já for Pro"],
  ],
  theme: "grid",
  headStyles: { fillColor: [37, 99, 235], textColor: 255 },
  bodyStyles: { fontSize: 9 },
  margin: { left: 10, right: 10 },
});

y = (doc as any).lastAutoTable.finalY + 5;
y = addBox(doc, y, "RECOMENDAÇÃO", ["Upstash Redis: serverless, pay-per-request, integra fácil com Hono. Custo ~$10-30/mês. Implementar quando tiver clientes pagantes (segurança crítica)."], VERDE);

y = addHeader(doc, "2.8 Storage de Arquivos — Fotos/Documentos", y);
y = addBox(doc, y, "STATUS", ["Não implementado. Não há upload de arquivos no sistema atual."], CINZA);

autoTable(doc, {
  startY: y,
  head: [["Opção", "Custo/GB", "Egress", "Setup", "Recomendação"]],
  body: [
    ["Supabase Storage", "Incluso no plano", "Incluso", "Simples", "Se já for Pro"],
    ["AWS S3", "~$0.023/GB", "$0.09/GB", "Médio", "Padrão da indústria"],
    ["Cloudflare R2", "~$0.015/GB", "GRÁTIS", "Simples", "RECOMENDADO — sem egress"],
  ],
  theme: "grid",
  headStyles: { fillColor: [37, 99, 235], textColor: 255 },
  bodyStyles: { fontSize: 9 },
  margin: { left: 10, right: 10 },
});

y = (doc as any).lastAutoTable.finalY + 5;
y = addBox(doc, y, "RECOMENDAÇÃO", ["Cloudflare R2: sem taxa de egress (transferência), preço competitivo. Ideal para fotos de eleitores e documentos. Implementar quando necessário."], VERDE);

y = addHeader(doc, "2.9 Outras Decisões Menores", y);

autoTable(doc, {
  startY: y,
  head: [["Decisão", "Status", "Opções", "Impacto Custo", "Prioridade"]],
  body: [
    ["Biblioteca de Ícones", "Testes feitos, não decidido", "Carbon / Material / Tabler", "R$ 0", "Baixa"],
    ["Prestação de Contas", "Backlog", "Funcionalidade do app", "R$ 0", "Média"],
    ["Website Integrado", "Backlog", "Mesmo Vercel", "R$ 0", "Baixa"],
    ["Webhook WAHA", "Não implementado", "Só código", "R$ 0", "Média"],
    ["Proposições", "Backend pronto, frontend básico", "Finalizar frontend", "R$ 0", "Baixa"],
    ["VPS Hardening", "Parcial", "HTTPS/SSL + Cloudflare Tunnel", "R$ 0", "Alta"],
  ],
  theme: "grid",
  headStyles: { fillColor: [37, 99, 235], textColor: 255 },
  bodyStyles: { fontSize: 8.5 },
  margin: { left: 10, right: 10 },
});

// ===================== PÁGINA 7: PROJEÇÃO =====================
pageNum++;
y = addPage(doc, pageNum);
y = addHeader(doc, "3. PROJEÇÃO DE CUSTOS POR FASE", y);

y = addText(doc, "Cenário conservador (crescimento orgânico, 1-2 clientes/mês):", y, { size: 9 });
y += 3;

autoTable(doc, {
  startY: y,
  head: [["Fase", "Clientes", "Supabase", "Vercel", "VPS", "WhatsApp", "Outros", "TOTAL/mês"]],
  body: [
    ["HOJE", "1", "R$ 0", "R$ 0", "R$ 40", "R$ 0", "R$ 0", "~R$ 40"],
    ["6 meses", "5", "R$ 0", "R$ 0", "R$ 60", "R$ 0", "R$ 0", "~R$ 60"],
    ["12 meses", "10", "R$ 135", "R$ 110", "R$ 80", "R$ 330", "R$ 0", "~R$ 655"],
    ["18 meses", "18", "R$ 135", "R$ 110", "R$ 100", "R$ 594", "R$ 50", "~R$ 989"],
    ["24 meses", "25", "R$ 325", "R$ 110", "R$ 100", "R$ 825", "R$ 80", "~R$ 1.440"],
  ],
  theme: "grid",
  headStyles: { fillColor: [37, 99, 235], textColor: 255 },
  bodyStyles: { fontSize: 9 },
  columnStyles: { 7: { fontStyle: "bold", fillColor: [248, 250, 252] } },
  margin: { left: 10, right: 10 },
});

y = (doc as any).lastAutoTable.finalY + 8;

y = addText(doc, "Cenário otimista (crescimento acelerado, 3-5 clientes/mês):", y, { size: 9 });
y += 3;

autoTable(doc, {
  startY: y,
  head: [["Fase", "Clientes", "Supabase", "Vercel", "VPS", "WhatsApp", "Outros", "TOTAL/mês"]],
  body: [
    ["HOJE", "1", "R$ 0", "R$ 0", "R$ 40", "R$ 0", "R$ 0", "~R$ 40"],
    ["6 meses", "15", "R$ 135", "R$ 110", "R$ 80", "R$ 495", "R$ 30", "~R$ 850"],
    ["12 meses", "40", "R$ 325", "R$ 110", "R$ 150", "R$ 1.320", "R$ 80", "~R$ 1.985"],
    ["18 meses", "70", "R$ 325", "R$ 110", "R$ 200", "R$ 2.310", "R$ 150", "~R$ 3.095"],
    ["24 meses", "100", "R$ 650+", "R$ 110", "R$ 300", "R$ 3.300", "R$ 250", "~R$ 4.610"],
  ],
  theme: "grid",
  headStyles: { fillColor: [37, 99, 235], textColor: 255 },
  bodyStyles: { fontSize: 9 },
  columnStyles: { 7: { fontStyle: "bold", fillColor: [248, 250, 252] } },
  margin: { left: 10, right: 10 },
});

y = (doc as any).lastAutoTable.finalY + 8;

y = addHeader(doc, "3.1 Gráfico de Crescimento — Custo Total", y);
y = addText(doc, "O maior gatilho de custo é o WhatsApp multi-cliente, representando ~50% do custo total em 12 meses. O segundo gatilho é o Supabase (upgrade Pro).", y, { size: 9 });
y += 5;

y = addBox(doc, y, "INSIGHT CHAVE", [
  "Com 10 clientes pagando R$ 249/mês (plano Profissional) = R$ 2.490 receita/mês.",
  "Custo estimado: R$ 655/mês. Margem bruta: ~74%.",
  "Com 25 clientes pagando R$ 249/mês = R$ 6.225 receita/mês.",
  "Custo estimado: R$ 1.440/mês. Margem bruta: ~77%.",
], VERDE);

// ===================== PÁGINA 8: RECOMENDAÇÕES =====================
pageNum++;
y = addPage(doc, pageNum);
y = addHeader(doc, "4. RECOMENDAÇÕES POR PRIORIDADE", y);

y = addText(doc, "Ordenadas por impacto em economia + segurança + facilidade de implementação:", y, { size: 9 });
y += 5;

const recomendacoes = [
  {
    prio: "P0 — CRÍTICO",
    cor: VERMELHO,
    items: [
      "1. Implementar backup automático (Cloudflare R2 + pg_dump) antes de ter clientes pagantes.",
      "2. Configurar HTTPS/SSL na VPS (Certbot gratuito) — segurança básica.",
      "3. Implementar webhook WAHA para status real de entrega (confiabilidade).",
    ],
  },
  {
    prio: "P1 — ALTO",
    cor: AMARELO,
    items: [
      "4. Decidir estratégia WhatsApp multi-cliente (WasenderAPI recomendado para Fase 2).",
      "5. Importar CNEFE da UF do mandato (geocodificação instantânea, zero custo).",
      "6. Implementar PWA (Vite PWA plugin) — diferencial competitivo, zero custo.",
    ],
  },
  {
    prio: "P2 — MÉDIO",
    cor: AZUL,
    items: [
      "7. Implementar envio de e-mail (Resend ou Brevo) — campanhas multicanal.",
      "8. Migrar rate limiting para Upstash Redis quando tiver clientes pagantes.",
      "9. Decidir biblioteca de ícones (Tabler já está no projeto, manter).",
    ],
  },
  {
    prio: "P3 — BAIXO",
    cor: VERDE,
    items: [
      "10. Finalizar frontend de Proposições Legislativas (backend já pronto).",
      "11. Implementar Prestação de Contas Pública (diferencial político).",
      "12. Avaliar Cloudflare Tunnel na VPS (esconder IP, segurança extra).",
    ],
  },
];

for (const rec of recomendacoes) {
  y = addBox(doc, y, rec.prio, rec.items, rec.cor);
}

// ===================== PÁGINA 9: OPORTUNIDADES + RISCOS =====================
pageNum++;
y = addPage(doc, pageNum);
y = addHeader(doc, "5. OPORTUNIDADES DE ECONOMIA", y);

autoTable(doc, {
  startY: y,
  head: [["Oportunidade", "Economia/mês", "Esforço", "Status"]],
  body: [
    ["Manter CNEFE próprio", "R$ 500-2.000", "Zero", "✅ Implementado"],
    ["Cache agressivo de CEP", "90% Here API", "Zero", "✅ Implementado"],
    ["Vercel Hobby máximo", "R$ 110", "Baixo", "✅ Em uso"],
    ["Supabase Free até 500MB", "R$ 135", "Médio", "✅ Em uso"],
    ["Evolution API vs Cloud (10+ clientes)", "~50% WhatsApp", "Alto", "⏳ Futuro"],
    ["Cloudflare R2 vs S3", "R$ 10-20", "Baixo", "⏳ Futuro"],
  ],
  theme: "grid",
  headStyles: { fillColor: [22, 163, 74], textColor: 255 },
  bodyStyles: { fontSize: 9 },
  margin: { left: 10, right: 10 },
});

y = (doc as any).lastAutoTable.finalY + 8;

y = addHeader(doc, "6. RISCOS DE CUSTO", y);

autoTable(doc, {
  startY: y,
  head: [["Risco", "Probabilidade", "Impacto", "Mitigação"]],
  body: [
    ["Egress Supabase estourar", "Média", "R$ 50-200/mês", "Monitorar, usar cache frontend"],
    ["WAHA parar de funcionar", "Média", "Indisponibilidade", "Ter plano B (Evolution/cloud)"],
    ["VPS cair", "Baixa", "R$ 40 + indisponibilidade", "Backup automático, monitoramento"],
    ["Here API mudar preço", "Baixa", "R$ 0-100/mês", "Depender mais do CNEFE"],
    ["Vercel limitar free tier", "Baixa", "R$ 110/mês", "Otimizar builds"],
    ["Supabase cobrar egress excessivo", "Média", "R$ 50-500/mês", "Cache agressivo, CDN"],
  ],
  theme: "grid",
  headStyles: { fillColor: [220, 38, 38], textColor: 255 },
  bodyStyles: { fontSize: 9 },
  margin: { left: 10, right: 10 },
});

// ===================== PÁGINA 10: CHECKLIST + FECHAMENTO =====================
pageNum++;
y = addPage(doc, pageNum);
y = addHeader(doc, "7. CHECKLIST DE AÇÕES IMEDIATAS", y);

y = addText(doc, "Ações que devem ser tomadas nos próximos 30 dias para garantir segurança e escalabilidade:", y, { size: 9 });
y += 5;

const checklist = [
  "□ Configurar HTTPS/SSL na VPS (Certbot — gratuito)",
  "□ Implementar backup automático (Cloudflare R2 + pg_dump cron)",
  "□ Escanear QR Code WAHA para conectar WhatsApp",
  "□ Monitorar métricas do Supabase (tamanho, egress, conexões)",
  "□ Decidir qual UF importar no CNEFE",
  "□ Testar conta WasenderAPI (grátis) para validar multi-cliente",
  "□ Definir preço do SaaS considerando custos (margem mínima 70%)",
  "□ Implementar PWA (Vite PWA plugin)",
  "□ Criar conta Resend ou Brevo para e-mail futuro",
  "□ Documentar runbook de deploy e rollback",
];

for (const item of checklist) {
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(CINZA_ESCURO);
  doc.text(item, 15, y);
  y += 6;
}

y += 5;

y = addHeader(doc, "8. FECHAMENTO", y);

y = addBox(doc, y, "RESUMO FINAL", [
  "Custo atual: ~R$ 40/mês (apenas VPS). Todos os outros serviços em free tier.",
  "14 decisões pendentes identificadas, todas com opções de mercado documentadas.",
  "Maior gatilho de custo: WhatsApp multi-cliente (R$ 30-40/cliente/mês).",
  "Maior economia: CNEFE próprio (evita R$ 500-2.000/mês em geocodificação).",
  "Margem projetada: 74-77% com preço de R$ 249/mês por cliente.",
  "Próximo passo crítico: backup + HTTPS + decisão WhatsApp.",
], AZUL);

y = addText(doc, "Documento gerado automaticamente por Kimi Code em 06/06/2026.", y + 5, { size: 8, color: CINZA });
y = addText(doc, "Para atualizações, execute: npx tsx scripts/gerar-analise-custos.ts", y + 4, { size: 8, color: CINZA });

// Salvar
const dir = dirname(OUTPUT_PATH);
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
doc.save(OUTPUT_PATH);

console.log(`✅ PDF gerado com sucesso: ${OUTPUT_PATH}`);
console.log(`📄 Total de páginas: ${doc.getNumberOfPages()}`);
