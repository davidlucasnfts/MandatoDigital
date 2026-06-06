/**
 * Script para gerar PDFs das conversas da sessão
 * Tópicos: Custos, Decisões Pendentes, WhatsApp Multi-cliente, Backup, Ciclo Eleitoral
 */

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { existsSync, mkdirSync } from "fs";

const OUTPUT_DIR = "docs";

const AZUL = "#2563eb";
const VERDE = "#16a34a";
const VERMELHO = "#dc2626";
const AMARELO = "#ca8a04";
const CINZA = "#64748b";
const CINZA_ESCURO = "#1e293b";
const BRANCO = "#ffffff";
const FUNDO = "#f8fafc";

function criarPDF(titulo: string): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  doc.setProperties({ title: titulo, author: "Kimi Code", creator: "Mandato Digital" });
  return doc;
}

function addPage(doc: jsPDF, numero: number, titulo?: string): number {
  doc.addPage();
  doc.setFillColor(FUNDO);
  doc.rect(0, 0, 210, 297, "F");
  doc.setFontSize(8);
  doc.setTextColor(CINZA);
  const headerText = titulo ? `Mandato Digital — ${titulo} | Página ${numero}` : `Mandato Digital | Página ${numero}`;
  doc.text(headerText, 105, 292, { align: "center" });
  return 15;
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

function addText(doc: jsPDF, texto: string, y: number, options?: { bold?: boolean; size?: number; color?: string }): number {
  const size = options?.size || 10;
  doc.setFontSize(size);
  doc.setFont("helvetica", options?.bold ? "bold" : "normal");
  doc.setTextColor(options?.color || CINZA_ESCURO);
  const lines = doc.splitTextToSize(texto, 190);
  doc.text(lines, 10, y);
  return y + lines.length * (size * 0.4);
}

// ============================================================
// PDF 1: DECISAO DE GASTOS E DESPESAS DO PROJETO
// ============================================================
{
  const doc = criarPDF("Decisao de Gastos e Despesas do Projeto");
  doc.setFillColor(FUNDO);
  doc.rect(0, 0, 210, 297, "F");
  doc.setFillColor(AZUL);
  doc.rect(0, 0, 210, 60, "F");
  doc.setTextColor(BRANCO);
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.text("DECISAO DE GASTOS", 105, 30, { align: "center" });
  doc.text("E DESPESAS DO PROJETO", 105, 42, { align: "center" });
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("Mandato Digital", 105, 55, { align: "center" });
  doc.setTextColor(CINZA);
  doc.setFontSize(10);
  doc.text("Sessão: 06/06/2026 | Análise completa de infraestrutura e custos", 105, 75, { align: "center" });

  let y = 90;
  doc.setFillColor(BRANCO);
  doc.roundedRect(15, y, 180, 55, 4, 4, "F");
  doc.setDrawColor(AZUL);
  doc.setLineWidth(0.5);
  doc.roundedRect(15, y, 180, 55, 4, 4, "S");
  doc.setTextColor(AZUL);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("RESUMO EXECUTIVO", 20, y + 10);
  doc.setTextColor(CINZA_ESCURO);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const resumo = [
    "• Custo mensal atual: ~R$ 40 (apenas VPS HostUp)",
    "• Todos os demais serviços em free tier: Supabase, Vercel, Here API, WAHA",
    "• 14 decisões pendentes identificadas com opções de mercado detalhadas",
    "• Projeção 12 meses (10 clientes): ~R$ 655/mês",
    "• Maior gatilho de custo: WhatsApp multi-cliente",
    "• Maior economia: CNEFE próprio (evita R$ 500-2.000/mês em geocodificação)",
  ];
  let ry = y + 18;
  for (const linha of resumo) { doc.text(linha, 20, ry); ry += 5; }

  y = 155;
  y = addHeader(doc, "STACK ATUAL DO PROJETO", y);
  autoTable(doc, {
    startY: y,
    head: [["Camada", "Tecnologia", "Plano", "Custo"]],
    body: [
      ["Frontend", "React 19 + TypeScript + Tailwind + shadcn/ui + Vite", "—", "R$ 0"],
      ["Backend", "tRPC + Hono + Drizzle ORM + Zod", "—", "R$ 0"],
      ["Banco de Dados", "PostgreSQL (Supabase)", "Free Tier", "R$ 0"],
      ["Autenticação", "Supabase Auth (JWT + OAuth)", "Incluso", "R$ 0"],
      ["Deploy Frontend", "Vercel (serverless)", "Hobby (Free)", "R$ 0"],
      ["VPS", "HostUp — CNEFE + WAHA WhatsApp", "2 CPU / 3.8GB RAM", "~R$ 40"],
      ["Mapas", "Leaflet + OpenStreetMap / CartoDB", "Open Source", "R$ 0"],
      ["WhatsApp", "WAHA API CORE", "Gratuito (1 sessão)", "R$ 0"],
      ["Geocodificação", "CNEFE próprio + Here API fallback", "Freemium 30k/mês", "R$ 0"],
      ["Dependências", "Todas npm (MIT/Apache)", "Open Source", "R$ 0"],
    ],
    theme: "grid",
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
    bodyStyles: { fontSize: 8.5, textColor: 30 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 35 }, 3: { cellWidth: 25, halign: "center" } },
    margin: { left: 10, right: 10 },
  });

  y = (doc as any).lastAutoTable.finalY + 8;
  y = addHeader(doc, "CUSTO DETALHADO POR SERVIÇO", y);

  autoTable(doc, {
    startY: y,
    head: [["Serviço", "Plano Atual", "Custo/mês", "Modelo", "Gatilho de Upgrade"]],
    body: [
      ["Vercel (Deploy)", "Hobby (Free)", "R$ 0", "Fixo", "100GB bandwidth, 1k builds/mês, 10s funções"],
      ["Supabase (Banco)", "Free Tier", "R$ 0", "Fixo", "500MB DB, 1GB storage, 2GB egress, 30 conexões"],
      ["VPS HostUp", "2 CPU / 3.8GB RAM", "~R$ 40", "Fixo", "RAM insuficiente, disco cheio"],
      ["Here API", "Freemium", "R$ 0", "Por uso", "30k requisições/mês"],
      ["WAHA WhatsApp", "CORE (Free)", "R$ 0", "Fixo", "Só 1 sessão — não suporta multi-cliente"],
      ["Leaflet / OpenStreetMap", "Open Source", "R$ 0", "Grátis", "Nenhum"],
      ["CNEFE (IBGE)", "Dados públicos", "R$ 0", "Grátis", "Nenhum"],
      ["Dependências npm", "Todas MIT/Apache", "R$ 0", "Grátis", "Nenhum"],
    ],
    theme: "grid",
    headStyles: { fillColor: [37, 99, 235], textColor: 255 },
    bodyStyles: { fontSize: 8.5 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 45 }, 2: { cellWidth: 25, halign: "center" } },
    margin: { left: 10, right: 10 },
  });

  y = (doc as any).lastAutoTable.finalY + 8;
  y = addHeader(doc, "PROJEÇÃO DE CUSTOS POR FASE", y);

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
  y = addBox(doc, y, "INSIGHT CHAVE", [
    "Com 10 clientes pagando R$ 249/mês (plano Profissional) = R$ 2.490 receita/mês.",
    "Custo estimado: R$ 655/mês. Margem bruta: ~74%.",
    "Com 25 clientes pagando R$ 249/mês = R$ 6.225 receita/mês.",
    "Custo estimado: R$ 1.440/mês. Margem bruta: ~77%.",
  ], VERDE);

  y = addText(doc, "Documento gerado em 06/06/2026 | Para atualizações: npx tsx scripts/gerar-analise-custos.ts", y + 5, { size: 8, color: CINZA });

  doc.save(`${OUTPUT_DIR}/decisao-de-gastos-e-despesas-do-projeto.pdf`);
  console.log("✅ PDF 1/4 gerado: decisao-de-gastos-e-despesas-do-projeto.pdf");
}

// ============================================================
// PDF 2: DECISOES PENDENTES E OPCOES DE MERCADO
// ============================================================
{
  const doc = criarPDF("Decisoes Pendentes e Opcoes de Mercado");
  doc.setFillColor(FUNDO);
  doc.rect(0, 0, 210, 297, "F");
  doc.setFillColor(AZUL);
  doc.rect(0, 0, 210, 60, "F");
  doc.setTextColor(BRANCO);
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.text("DECISÕES PENDENTES", 105, 30, { align: "center" });
  doc.text("E OPÇÕES DE MERCADO", 105, 42, { align: "center" });
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("Mandato Digital", 105, 55, { align: "center" });
  doc.setTextColor(CINZA);
  doc.setFontSize(10);
  doc.text("14 decisões arquiteturais e funcionais em standby", 105, 75, { align: "center" });

  let y = 90;
  y = addHeader(doc, "LISTA COMPLETA DE DECISÕES PENDENTES", y);

  autoTable(doc, {
    startY: y,
    head: [["#", "Decisão", "Status", "Opções", "Impacto Custo", "Prioridade"]],
    body: [
      ["1", "WhatsApp multi-cliente", "ADR-006 proposto", "WAHA/Evolution/Cloud/Oficial", "R$ 30-40/cliente", "Alta"],
      ["2", "Geocodificação CNEFE", "Aguardando UF", "1-2 estados/Nominatim/Cache/ViaCEP/Pro", "R$ 0-135/mês", "Alta"],
      ["3", "E-mail (campanhas)", "Código preparado", "Resend/SendGrid/Brevo/AWS SES", "R$ 0-50/mês", "Média"],
      ["4", "PWA / App Mobile", "Mencionado na landing", "PWA/React Native/Flutter", "R$ 0", "Média"],
      ["5", "Backup automático", "Não implementado", "R2/S3/pg_dump manual/Supabase Pro", "R$ 0-135/mês", "Crítica"],
      ["6", "Rate Limiting Redis", "Hono in-memory", "Upstash/Redis Cloud/Supabase Pro", "R$ 0-30/mês", "Média"],
      ["7", "Storage de arquivos", "Não implementado", "Supabase Storage/S3/R2", "R$ 0-50/mês", "Baixa"],
      ["8", "VPS Hardening", "Parcial", "HTTPS/SSL + Cloudflare Tunnel", "R$ 0", "Alta"],
      ["9", "Webhook WAHA", "Não implementado", "Só código", "R$ 0", "Média"],
      ["10", "Proposições Legislativas", "Backend pronto", "Finalizar frontend", "R$ 0", "Baixa"],
      ["11", "Prestação de Contas", "Backlog", "Funcionalidade do app", "R$ 0", "Média"],
      ["12", "Website Integrado", "Backlog", "Mesmo Vercel", "R$ 0", "Baixa"],
      ["13", "Biblioteca de Ícones", "Testes feitos", "Carbon/Material/Tabler", "R$ 0", "Baixa"],
      ["14", "Arquivamento de dados", "Não pensado", "CSV no R2/particionamento", "R$ 0", "Média"],
    ],
    theme: "grid",
    headStyles: { fillColor: [37, 99, 235], textColor: 255 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 10, right: 10 },
  });

  y = (doc as any).lastAutoTable.finalY + 8;
  y = addHeader(doc, "OPÇÕES DE MERCADO DETALHADAS", y);

  y = addText(doc, "1. WHATSAPP MULTI-CLIENTE", y, { bold: true, size: 11, color: AZUL });
  y += 4;
  autoTable(doc, {
    startY: y,
    head: [["Opção", "Custo 10 clientes", "Setup", "Manutenção", "Isolamento", "Recomendação"]],
    body: [
      ["1 VPS/cliente (WAHA)", "R$ 300-500/mês", "Médio", "Média", "Total (físico)", "NUNCA — custo linear"],
      ["Evolution API (1 VPS)", "R$ 50-100/mês", "Complexo", "Alta", "Lógico (token)", "10+ clientes, margem apertada"],
      ["WasenderAPI (Cloud)", "R$ 330/mês", "5 minutos", "Zero", "Total (cloud)", "FASE 2 (2-10 clientes)"],
      ["Wappfly (Cloud)", "R$ 385/mês", "5 minutos", "Zero", "Total (cloud)", "Alternativa ao Wasender"],
      ["Meta Oficial", "R$ 200-800/mês", "Burocrático", "Baixa", "Total (oficial)", "DESCARTADO — número pessoal"],
    ],
    theme: "grid",
    headStyles: { fillColor: [37, 99, 235], textColor: 255 },
    bodyStyles: { fontSize: 8.5 },
    margin: { left: 10, right: 10 },
  });

  y = (doc as any).lastAutoTable.finalY + 5;
  y = addBox(doc, y, "RECOMENDAÇÃO WHATSAPP", [
    "FASE 1 (1 cliente): Manter WAHA na VPS atual — custo zero.",
    "FASE 2 (2-10 clientes): Migrar para WasenderAPI ou Wappfly — setup em 5 minutos.",
    "FASE 3 (10+ clientes): Reavaliar Evolution API vs Cloud conforme margem.",
    "Meta Oficial: DESCARTADA — vereadores usam número pessoal, não empresa.",
  ], VERDE);

  y = addText(doc, "2. GEOCODIFICAÇÃO", y, { bold: true, size: 11, color: AZUL });
  y += 4;
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
  y = addBox(doc, y, "RECOMENDAÇÃO GEOCODIFICAÇÃO", [
    "Híbrido: Importar CNEFE da UF principal do mandato (~15-300 MB).",
    "Para outros estados: cache inteligente + Nominatim fallback.",
    "Resultado: 80% dos eleitores com geocodificação instantânea e precisa, sem custo.",
  ], VERDE);

  y = addText(doc, "3. E-MAIL (CAMPANHAS)", y, { bold: true, size: 11, color: AZUL });
  y += 4;
  autoTable(doc, {
    startY: y,
    head: [["Opção", "Custo", "Limite Free", "Setup", "Recomendação"]],
    body: [
      ["Resend", "$0.0001/email", "100 emails/dia", "Simples", "API moderna, documentação excelente"],
      ["Brevo", "Grátis", "300 emails/dia", "Simples", "Free tier mais generoso"],
      ["SendGrid", "$0.0001/email", "100 emails/dia", "Médio", "Padrão da indústria"],
      ["AWS SES", "$0.0001/email", "Nenhum", "Complexo", "Só se já usa AWS"],
    ],
    theme: "grid",
    headStyles: { fillColor: [37, 99, 235], textColor: 255 },
    bodyStyles: { fontSize: 9 },
    margin: { left: 10, right: 10 },
  });

  y = (doc as any).lastAutoTable.finalY + 5;
  y = addBox(doc, y, "RECOMENDAÇÃO E-MAIL", [
    "Resend: API moderna, documentação excelente, preço competitivo.",
    "Brevo: Free tier mais generoso (300/dia) — bom para começar sem custo.",
    "Implementar quando campanhas de e-mail forem demanda real dos clientes.",
  ], VERDE);

  doc.save(`${OUTPUT_DIR}/decisoes-pendentes-e-opcoes-de-mercado.pdf`);
  console.log("✅ PDF 2/4 gerado: decisoes-pendentes-e-opcoes-de-mercado.pdf");
}

// ============================================================
// PDF 3: WHATSAPP MULTI-CLIENTE — ANALISE APROFUNDADA
// ============================================================
{
  const doc = criarPDF("WhatsApp Multi-Cliente — Analise Aprofundada");
  doc.setFillColor(FUNDO);
  doc.rect(0, 0, 210, 297, "F");
  doc.setFillColor(AZUL);
  doc.rect(0, 0, 210, 60, "F");
  doc.setTextColor(BRANCO);
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.text("WHATSAPP MULTI-CLIENTE", 105, 30, { align: "center" });
  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.text("Análise Aprofundada", 105, 45, { align: "center" });
  doc.setFontSize(12);
  doc.text("Plano de venda: R$ 250/mês por cliente", 105, 55, { align: "center" });

  let y = 70;
  y = addBox(doc, y, "PROBLEMA", [
    "WAHA CORE suporta apenas 1 sessão WhatsApp.",
    "Cada vereador precisa de seu próprio WhatsApp isolado.",
    "Se 2 vereadores usarem o mesmo sistema, um vê as mensagens do outro.",
    "Cada cliente precisa de: sessão isolada, QR Code próprio, token separado.",
  ], VERMELHO);

  y = addHeader(doc, "OPÇÃO A: 1 VPS POR CLIENTE (WAHA)", y);
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
    "Custo cresce linearmente: 10 clientes = R$ 300-500/mês SÓ em VPS.",
    "Manutenção distribuída: atualizar Docker, sistema, WAHA em N servidores.",
    "Gerenciamento complexo: N IPs, N domínios, N certificados SSL.",
    "Escalabilidade ruim: cada novo cliente = nova infraestrutura.",
    "MARGEM COM PLANO DE R$ 250: 10 clientes = R$ 2.500 receita - R$ 500 VPS = 80% margem, mas insustentável.",
  ], VERMELHO);

  y = addHeader(doc, "OPÇÃO B: EVOLUTION API — 1 VPS MAIOR", y);
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

  let pageNum = 2;
  y = addPage(doc, pageNum, "WhatsApp Multi-Cliente — Analise Aprofundada");
  y = addHeader(doc, "OPÇÃO C: SERVIÇO CLOUD (WASENDERAPI / WAPPFLY / WHAPI)", y);
  y = addBox(doc, y, "FUNCIONAMENTO", [
    "Você não gerencia servidor NENHUM.",
    "Cada cliente conecta seu WhatsApp via QR Code no painel do serviço.",
    "Seu sistema manda mensagens via API REST (HTTP POST) para o serviço.",
    "O serviço gerencia sessões, reconexões, atualizações do WhatsApp Web.",
  ], CINZA);

  autoTable(doc, {
    startY: y,
    head: [["Serviço", "Preço/número", "Preço 10 clientes", "Setup", "Manutenção"]],
    body: [
      ["WasenderAPI", "$6/mês ≈ R$ 33", "R$ 330/mês", "5 minutos", "Zero"],
      ["Wappfly", "$7/mês ≈ R$ 38", "R$ 385/mês", "5 minutos", "Zero"],
      ["Whapi.Cloud", "$5-10/mês", "R$ 250-500/mês", "5 minutos", "Zero"],
      ["Z-API", "R$ 49/mês", "R$ 490/mês", "5 minutos", "Zero"],
    ],
    theme: "grid",
    headStyles: { fillColor: [37, 99, 235], textColor: 255 },
    bodyStyles: { fontSize: 9 },
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
    "Margem menor: R$ 33/mês de custo em um plano de R$ 250 = 13% só de WhatsApp.",
  ], VERMELHO);

  y = addHeader(doc, "OPÇÃO D: WHATSAPP BUSINESS API OFICIAL (META)", y);
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
    "OVERKILL para vereadores: eles usam número pessoal, não empresa.",
  ], VERMELHO);

  y = addHeader(doc, "COMPARATIVO FINAL", y);
  autoTable(doc, {
    startY: y,
    head: [["Critério", "1 VPS/cliente", "Evolution API", "Cloud (Wasender)", "Oficial Meta"]],
    body: [
      ["Custo 10 clientes", "R$ 300-500", "R$ 50-100", "R$ 330", "R$ 200-800*"],
      ["Setup", "Médio", "Complexo", "Simples", "Burocrático"],
      ["Manutenção", "Média", "Alta", "Zero", "Baixa"],
      ["Isolamento", "Total (físico)", "Lógico (token)", "Total (cloud)", "Total (oficial)"],
      ["Escalabilidade", "Ruim (linear)", "Boa (~50)", "Ilimitada", "Ilimitada"],
      ["Número pessoal", "✅ Sim", "✅ Sim", "✅ Sim", "❌ Não"],
      ["Margem com R$ 250", "~60%", "~84%", "~87%", "~50%"],
    ],
    theme: "grid",
    headStyles: { fillColor: [37, 99, 235], textColor: 255 },
    bodyStyles: { fontSize: 8.5 },
    margin: { left: 10, right: 10 },
  });

  y = (doc as any).lastAutoTable.finalY + 5;
  y = addBox(doc, y, "RECOMENDAÇÃO FINAL", [
    "FASE 1 (1 cliente): Manter WAHA na VPS atual. Custo zero. Funciona.",
    "FASE 2 (2-10 clientes): Migrar para WasenderAPI ou Wappfly.",
    "  • Setup em 5 minutos, zero manutenção, custo previsível.",
    "  • Testar com 1 cliente primeiro, manter WAHA como fallback.",
    "FASE 3 (10+ clientes): Reavaliar Evolution API vs Cloud.",
    "  • Margem alta (>70%) → cloud (simplicidade vale o custo).",
    "  • Margem apertada (<50%) → Evolution API em VPS dedicada.",
    "OPÇÃO META OFICIAL: DESCARTADA — vereadores usam número pessoal.",
  ], VERDE);

  doc.save(`${OUTPUT_DIR}/whatsapp-multi-cliente-analise-aprovundada.pdf`);
  console.log("✅ PDF 3/4 gerado: whatsapp-multi-cliente-analise-aprovundada.pdf");
}

// ============================================================
// PDF 4: BACKUP AUTOMATICO — GUIA COMPLETO
// ============================================================
{
  const doc = criarPDF("Backup Automatico — Guia Completo");
  doc.setFillColor(FUNDO);
  doc.rect(0, 0, 210, 297, "F");
  doc.setFillColor(VERDE);
  doc.rect(0, 0, 210, 60, "F");
  doc.setTextColor(BRANCO);
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.text("BACKUP AUTOMÁTICO", 105, 30, { align: "center" });
  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.text("Guia Completo", 105, 45, { align: "center" });
  doc.setFontSize(12);
  doc.text("100% Gratuito | Cloudflare R2 + pg_dump + cron", 105, 55, { align: "center" });

  let y = 70;
  y = addBox(doc, y, "É GRATIS? SIM!", [
    "pg_dump: vem com PostgreSQL — R$ 0",
    "gzip: já existe no Linux — R$ 0",
    "cron: já existe no Linux — R$ 0",
    "Cloudflare R2: 10 GB gratuitos — R$ 0",
    "rclone: open source — R$ 0",
    "TOTAL: R$ 0 (até ultrapassar 10 GB de backups)",
  ], VERDE);

  y = addHeader(doc, "COMO FUNCIONA PASSO A PASSO", y);
  y = addBox(doc, y, "FLUXO DIÁRIO (3h DA MANHÃ)", [
    "1. pg_dump conecta no Supabase → gera backup-2026-06-06.sql",
    "2. gzip comprime → backup-2026-06-06.sql.gz (~2-4 MB)",
    "3. rclone envia para Cloudflare R2 → r2://mandato-backups/diario/",
    "4. Script apaga backups antigos → mantém últimos 7 dias + 1 por mês",
    "5. Registra log → sucesso ou erro fica salvo no servidor",
  ], AZUL);

  y = addHeader(doc, "QUANTO ESPAÇO VAI OCUPAR?", y);
  autoTable(doc, {
    startY: y,
    head: [["Fase", "Tamanho banco", "Backup comprimido", "7 dias", "12 meses (mensal)"]],
    body: [
      ["Hoje", "20 MB", "~3 MB", "21 MB", "36 MB"],
      ["6 meses", "200 MB", "~30 MB", "210 MB", "360 MB"],
      ["12 meses", "600 MB", "~90 MB", "630 MB", "1,08 GB"],
      ["24 meses", "2 GB", "~300 MB", "2,1 GB", "3,6 GB"],
    ],
    theme: "grid",
    headStyles: { fillColor: [22, 163, 74], textColor: 255 },
    bodyStyles: { fontSize: 9 },
    margin: { left: 10, right: 10 },
  });

  y = (doc as any).lastAutoTable.finalY + 5;
  y = addBox(doc, y, "LIMITE GRATUITO", [
    "Cloudflare R2 oferece 10 GB de armazenamento gratuito.",
    "Para o tamanho do seu banco hoje (~20 MB), você tem espaço por 2-3 ANOS.",
    "Só paga se ultrapassar 10 GB — e mesmo assim é barato (~R$ 0,015/GB).",
  ], VERDE);

  y = addHeader(doc, "RESTAURAÇÃO — 3 CENÁRIOS", y);
  y = addBox(doc, y, "CENÁRIO A: APAGOU DADOS SEM QUERER", [
    "1. Acessa Cloudflare R2",
    "2. Baixa: backup-2026-06-06.sql.gz",
    "3. Descompacta: gunzip backup-2026-06-06.sql.gz",
    "4. Restaura: psql DATABASE_URL < backup-2026-06-06.sql",
    "5. Pronto — tudo de volta",
  ], AMARELO);
  y = addBox(doc, y, "CENÁRIO B: SUPABASE FOI DELETADO", [
    "1. Cria novo projeto no Supabase",
    "2. Pega nova DATABASE_URL",
    "3. Restaura o backup no novo projeto",
    "4. Atualiza DATABASE_URL na Vercel",
    "5. Sistema volta a funcionar",
  ], VERMELHO);
  y = addBox(doc, y, "CENÁRIO C: SÓ QUER VER DADO ANTIGO", [
    "1. Restaura o backup em banco local (na sua máquina)",
    "2. Consulta o dado que precisa",
    "3. Não precisa mexer no banco de produção",
  ], CINZA);

  let pageNum = 2;
  y = addPage(doc, pageNum, "Backup Automatico — Guia Completo");
  y = addHeader(doc, "O QUE VOCÊ PRECISA FAZER (5 MINUTOS)", y);
  y = addBox(doc, y, "PASSO 1: CRIAR CONTA CLOUDFLARE", [
    "Acesse: https://dash.cloudflare.com/sign-up",
    "Use seu e-mail pessoal",
    "Confirme o e-mail",
    "Não precisa adicionar site/domínio agora",
  ], AZUL);
  y = addBox(doc, y, "PASSO 2: CRIAR BUCKET R2", [
    "No painel Cloudflare, vá em R2 Object Storage",
    "Clique 'Create bucket'",
    "Nome: mandato-digital-backups",
    "Localização: South America (se disponível)",
    "Clique 'Create'",
  ], AZUL);
  y = addBox(doc, y, "PASSO 3: GERAR API TOKEN", [
    "Vá em 'Manage R2 API Tokens'",
    "Clique 'Create API Token'",
    "Permissões: Object Read & Write",
    "Copie: Access Key ID, Secret Access Key, Endpoint URL",
  ], AZUL);
  y = addBox(doc, y, "PASSO 4: ENVIAR PARA O KIMI", [
    "Access Key ID",
    "Secret Access Key",
    "Endpoint URL do R2",
    "Nome do bucket (mandato-digital-backups)",
    "O Kimi configura o resto na VPS",
  ], VERDE);

  y = addHeader(doc, "O QUE O KIMI FAZ (RESTO)", y);
  y = addBox(doc, y, "CONFIGURAÇÃO COMPLETA", [
    "Instalar rclone na VPS",
    "Configurar rclone com credenciais do Cloudflare",
    "Criar script /opt/backup-mandato.sh",
    "Configurar cron (todo dia às 3h)",
    "Testar backup manualmente",
    "Configurar rotação (apagar backups antigos)",
    "Documentar como restaurar",
  ], VERDE);

  y = addHeader(doc, "COMPARAÇÃO: GRATUITO vs PAGO", y);
  autoTable(doc, {
    startY: y,
    head: [["Recurso", "Gratuito (nossa solução)", "Pago (Supabase Pro PITR)"]],
    body: [
      ["Custo", "R$ 0", "R$ 135/mês"],
      ["Frequência", "1x ao dia", "Contínuo (a cada minuto)"],
      ["Recuperação", "Último backup (até 24h atrás)", "Qualquer momento"],
      ["Setup", "30 min", "Automático"],
      ["Retenção", "7 dias + mensais", "Configurável"],
    ],
    theme: "grid",
    headStyles: { fillColor: [22, 163, 74], textColor: 255 },
    bodyStyles: { fontSize: 9 },
    margin: { left: 10, right: 10 },
  });

  y = (doc as any).lastAutoTable.finalY + 5;
  y = addBox(doc, y, "CONCLUSÃO", [
    "Para o estágio do projeto, o backup gratuito é mais que suficiente.",
    "O PITR do Supabase Pro é luxo — útil para empresa grande.",
    "Com 20 MB de banco hoje, você não paga nada por anos.",
    "O único trabalho seu: criar conta Cloudflare e passar 4 credenciais.",
    "O resto o Kimi configura em 30 minutos.",
  ], VERDE);

  doc.save(`${OUTPUT_DIR}/backup-automatico-guia-completo.pdf`);
  console.log("✅ PDF 4/4 gerado: backup-automatico-guia-completo.pdf");
}

console.log("\n📁 Todos os PDFs salvos em: docs/");
console.log("1. decisao-de-gastos-e-despesas-do-projeto.pdf");
console.log("2. decisoes-pendentes-e-opcoes-de-mercado.pdf");
console.log("3. whatsapp-multi-cliente-analise-aprovundada.pdf");
console.log("4. backup-automatico-guia-completo.pdf");
