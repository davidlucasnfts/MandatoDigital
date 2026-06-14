# Análise Competitiva — O Assessor vs Mandato Digital

> **Data da análise:** 13/06/2026  
> **Concorrente:** O Assessor (`https://lp.oassessor.com.br`)  
> **Preço público:** R$ 249,00/mês (plano mensal)  
> **Objetivo:** Entender o modelo de negócio, custos, limitações e oportunidades de posicionamento do Mandato Digital.

---

## 1. Resumo Executivo

**O Assessor é um software de gestão política de nicho** que cobra **R$ 249/mês** por um pacote único de CRM eleitoral, comunicação, demandas e equipe. Seu principal gancho de venda é **"custo-benefício"**: contatos ilimitados, subcontas ilimitadas e suporte humano incluso.

**Principais conclusões para o Mandato Digital:**

1. **O modelo de R$ 249 fixo + ilimitado é arriscado.** Clientes grandes (5.000–10.000+ contatos) consomem infra e suporte desproporcionalmente, reduzindo a margem do O Assessor.
2. **A precificação por tier é a melhor defesa de lucro.** O Mandato Digital deve cobrar pelo **volume de eleitores, usuários e sessões de WhatsApp**, não por uma caixa-preta ilimitada.
3. **Há espaço para competir embaixo e em cima:**
   - **Embaixo (R$ 149–199):** vereadores pequenos que acham R$ 249 caro.
   - **Em cima (R$ 299–499+):** vereadores/campanhas que precisam de mapa, CNEFE, automações e múltiplas sessões de WhatsApp.
4. **Diferenciais técnicos do Mandato Digital** (mapa georeferenciado, CNEFE, multi-tenant moderno, stack React 19 + tRPC + Supabase) permitem posicionar como a opção **escalável e profissional**.
5. **A margem do O Assessor em clientes grandes provavelmente é baixa ou negativa** quando consideramos suporte humano e custos reais de WhatsApp/SMS.

---

## 2. O que é dado confirmado vs inferência

| Tipo | Itens |
|------|-------|
| **Confirmado pelo site/contato** | Preço R$ 249/mês mensal; plano anual com desconto; teste grátis via WhatsApp; cadastro ilimitado; subcontas ilimitadas; suporte por e-mail/telefone/WhatsApp; sem taxa de adesão; SMS pré-pago; e-mail via Brevo (300/dia grátis); migração de dados; exportação em planilha; garantia 7 dias. |
| **Inferido por análise de mercado** | Stack provavelmente PHP/Laravel ou Node.js + MySQL/PostgreSQL; hospedagem em VPS ou serviço compartilhado; WhatsApp provavelmente não-oficial (Baileys ou serviço de terceiros); modelo provavelmente multi-tenant; equipe de suporte pequena. |
| **Estimado com base em benchmarks** | Custos de infra, suporte, margem e custo por cliente. Números marcados como "estimativa" devem ser tratados como cenários, não como dados auditados. |

---

## 3. Análise da Estrutura de Negócio do O Assessor

### 3.1 Modelo de precificação

- **Plano único com preço fixo:** R$ 249/mês no mensal. Plano anual com desconto progressivo (quanto maior o período, menor o valor mensal).
- **Sem tiers por volume:** não há limite público de contatos, usuários ou mensagens.
- **Sem taxa de setup:** barreira de entrada baixa.
- **Garantia de 7 dias:** reduz percepção de risco.

**Por que R$ 249?**

O valor está posicionado como **acessível para vereadores de pequeno e médio porte**. É alto o suficiente para parecer profissional, mas baixo o suficiente para ser aprovado rapidamente por um parlamentar. Provavelmente foi definido por:

1. Benchmark com softwares de nicho político.
2. Custo operacional médio por cliente + margem desejada.
3. Teste de elasticidade de preço no mercado de campanhas.

### 3.2 O que está incluso no preço

| Incluso | Observação |
|---------|------------|
| Cadastro ilimitado de contatos | Principal gancho de venda. |
| Subcontas ilimitadas | Permite equipe usar sem custo extra. |
| Gestão de base eleitoral | CRM com segmentação básica. |
| Solicitações/demandas | Controle de demandas do mandato. |
| Comunicação (e-mail/WhatsApp) | E-mail via Brevo (até 300/dia grátis). WhatsApp provavelmente incluso com limites práticos. |
| Relatórios e dashboards básicos | Análise de dados estratégicos declarada. |
| Suporte humano | E-mail, telefone e WhatsApp. |
| Migração e exportação | Facilita entrada e saída de clientes. |

### 3.3 Custos ocultos para o cliente

| Custo extra | Quando aparece |
|-------------|----------------|
| **SMS pré-pago** | Campanhas de SMS em massa. |
| **E-mail acima de 300/dia** | Upgrade no Brevo ou outro provedor. |
| **Créditos de WhatsApp oficial** | Se usarem API oficial da Meta, custo por conversa. |
| **Suporte fora do horário** | Geralmente não incluso em planos simples. |
| **Personalizações** | Relatórios, campos ou automações extras. |
| **Mão de obra interna** | Tempo da equipe alimentando o sistema. |

### 3.4 Público-alvo

| Perfil | Adequação |
|--------|-----------|
| **Vereadores iniciantes / pequenos** | ⭐⭐⭐⭐⭐ Ideal: preço fixo, simples, sem setup. |
| **Vereadores médios (2.000–5.000 eleitores)** | ⭐⭐⭐⭐ Bom, mas pode sentir falta de automações. |
| **Vereadores grandes / prefeitos** | ⭐⭐ Limitado: sem mapa avançado, sem CNEFE, sem múltiplas sessões de WhatsApp. |
| **Campanhas eleitorais** | ⭐⭐⭐ Funciona para gestão básica, mas não para operação de campo avançada. |

### 3.5 Ponto de venda principal

- **Custo-benefício** (“melhor custo-benefício do mercado”).
- **Simplicidade** (pouca curva de aprendizado).
- **Suporte humano** (atendimento por WhatsApp/telefone, algo raro em SaaS barato).
- **Sem burocracia** (sem setup, sem limite de contatos).

---

## 4. Estimativa da Estrutura Técnica e Infra

### 4.1 Stack provável

| Camada | Estimativa | Justificativa |
|--------|------------|---------------|
| **Frontend** | Vue.js ou React | Landing page moderna, mas não indica stack interna. |
| **Backend** | PHP/Laravel ou Node.js | Comum em softwares de nicho brasileiros. |
| **Banco de dados** | MySQL ou PostgreSQL | Padrão de mercado. |
| **WhatsApp** | Não-oficial (Baileys, WhatsApp Web.js ou serviço de terceiros) | Preço fixo baixo sugere que não usam API oficial da Meta. |
| **E-mail** | Brevo (antigo Sendinblue) | Confirmado: até 300 e-mails/dia grátis. |
| **SMS** | Gateway de terceiros (Zenvia, Twilio, TotalVoice) | Cobrado como crédito pré-pago. |
| **Hospedagem** | VPS nacional ou serviço compartilhado | Preço do plano não permite cloud enterprise. |

### 4.2 Tipo de banco e arquitetura

| Aspecto | Estimativa |
|---------|------------|
| **Multi-tenant?** | Provavelmente **sim**, com schema ou banco separado por cliente. Preço fixo e ilimitado favorece arquitetura compartilhada. |
| **Escalabilidade** | Média. Sem limites declarados, mas performance pode degradar com 10.000+ contatos em ambiente compartilhado. |
| **Backup** | Provavelmente automático do provedor (VPS/cloud). |

### 4.3 Custos estimados de infra por cliente

Cenário: servidor compartilhado/VPS de **R$ 200–400/mês** atendendo 20–50 clientes.

| Perfil de cliente | Custo infra estimado/mês |
|-------------------|--------------------------|
| Pequeno (500 contatos) | R$ 10–20 |
| Médio (2.000 contatos) | R$ 20–40 |
| Grande (5.000 contatos) | R$ 50–80 |
| Gigante (10.000+) | R$ 100–180 |

> Infra inclui: servidor, banco, armazenamento, backup e ferramentas básicas. **Não inclui WhatsApp/SMS/e-mail acima do grátis.**

### 4.4 Custo de suporte humano

| Cenário | Custo estimado/mês |
|---------|--------------------|
| 1 atendente dedicado (salário + encargos) | R$ 3.500–5.500 |
| Atendimento fracionado (dono/responsável) | R$ 1.500–3.000 |
| Suporte terceirizado por ticket | R$ 1.000–2.500 |

**Custo de suporte por cliente** (supondo 30 clientes por atendente):

| Clientes/atendente | Custo suporte/cliente |
|--------------------|-----------------------|
| 20 | R$ 175–275 |
| 30 | R$ 115–185 |
| 50 | R$ 70–110 |

---

## 5. Comparação Direta: O Assessor vs Mandato Digital

| Critério | O Assessor | Mandato Digital (proposta) |
|----------|------------|----------------------------|
| **Preço ao cliente** | R$ 249/mês fixo | R$ 149–499/mês por tier |
| **Modelo de precificação** | Único plano, ilimitado | Tiered por eleitores/usuários/sessões |
| **Cadastro de eleitores** | Ilimitado | Limitado por plano |
| **Subcontas/usuários** | Ilimitadas | Limitado por plano |
| **WhatsApp** | Incluso (provavelmente 1 sessão não-oficial) | 1 sessão grátis (WAHA) + opção multi-sessão paga |
| **Mapa georeferenciado / CNEFE** | Não declarado | Diferencial técnico |
| **Automações** | Básico / não declarado | Possível (workflows, gatilhos) |
| **Relatórios** | Básicos | Avançados (BI, filtros, exportações) |
| **Suporte** | E-mail, telefone, WhatsApp | WhatsApp + e-mail + documentação |
| **Stack / escalabilidade** | Tradicional, média | Moderna (React 19, tRPC, Supabase, Vercel), alta |
| **Setup / implantação** | Sem taxa | Sem taxa (ou onboarding opcional) |
| **Público-alvo ideal** | Vereador pequeno/médio | Vereador pequeno a grande / campanhas |
| **Principal risco** | Margem baixa em clientes grandes | Complexidade de gerenciar tiers |

### 5.1 Vantagens competitivas do O Assessor

- Preço fixo e previsível.
- Suporte humano já consolidado.
- Sem limites declarados (apelação emocional forte).
- Marca estabelecida no nicho político.

### 5.2 Vantagens competitivas do Mandato Digital

- Stack moderna e escalável.
- Mapa com geolocalização e CNEFE.
- Multi-tenant eficiente (Vercel + Supabase).
- Possibilidade de múltiplas sessões de WhatsApp.
- Modelo de precificação que protege margem.
- Curva de aprendizado pode ser mais enxuta com UI moderna (shadcn/ui).

---

## 6. Análise de Custos por Cliente do O Assessor

**Receita fixa:** R$ 249/mês.

### 6.1 Cenários de cliente

| Perfil | Contatos | Mensagens/mês estimadas | Infra estimada | WhatsApp/SMS estimado | Suporte estimado | **Custo total estimado** | **Margem líquida estimada** |
|--------|----------|------------------------:|----------------|------------------------|------------------|--------------------------:|------------------------------:|
| **Pequeno** | 500 | 1.000 | R$ 15 | R$ 5 | R$ 80 | R$ 100 | **R$ 149 (60%)** |
| **Médio** | 2.000 | 5.000 | R$ 30 | R$ 20 | R$ 120 | R$ 170 | **R$ 79 (32%)** |
| **Grande** | 5.000 | 15.000 | R$ 65 | R$ 60 | R$ 180 | R$ 305 | **-R$ 56 (-22%)** |
| **Gigante** | 10.000+ | 40.000+ | R$ 140 | R$ 150 | R$ 300 | R$ 590 | **-R$ 341 (-137%)** |

### 6.2 Hipóteses dos custos

- **Infra:** proporcional ao uso de banco, processamento e armazenamento.
- **WhatsApp/SMS:** estimado em R$ 0,01–0,02 por mensagem enviada (média ponderada entre WhatsApp não-oficial de baixo custo e SMS pago).
- **Suporte:** clientes grandes demandam mais atenção, tickets e treinamento.

### 6.3 O que isso significa

O modelo de **R$ 249 fixo é lucrativo para clientes pequenos e médios**, mas tende a **dar prejuízo em clientes grandes**. O O Assessor provavelmente:

1. **Limita indiretamente** clientes gigantes (por performance, suporte ou regras de uso justo).
2. **Ganha na média** com a base maior de clientes pequenos.
3. **Tem churn natural** de clientes grandes que crescem e migram para soluções enterprise.

---

## 7. Armadilhas do Modelo do O Assessor

| Armadilha | Explicação | Impacto no negócio |
|-----------|------------|--------------------|
| **Prejuízo com cliente gigante** | Clientes com 10.000+ contatos consomem infra e suporte desproporcionalmente. | Margem negativa em contas grandes. |
| **Limitação do WhatsApp** | Se usa WhatsApp não-oficial, há risco de bloqueio e limites da Meta. | Insatisfação e churn. |
| **Custos de suporte escalando** | Suporte humano não escala linearmente; cada novo cliente aumenta carga. | Margem comprimida conforme cresce. |
| **Performance com muitos contatos** | Banco compartilhado pode ficar lento com bases enormes. | Reclamações e saída de clientes grandes. |
| **Falta de diferenciação técnica** | Funcionalidades genéricas (CRM, demandas, relatórios) são fáceis de replicar. | Pressão de preço e concorrência. |
| **Dependência de suporte humano** | Modelo de atendimento intenso dificulta crescimento sem contratar. | Menor escalabilidade operacional. |

---

## 8. Lições e Oportunidades para o Mandato Digital

### 8.1 Onde podemos ser mais baratos

| Oportunidade | Como fazer |
|--------------|------------|
| **Plano de entrada** | Oferecer plano a R$ 149/mês para vereadores pequenos, com limite de 1.000 eleitores e 1 usuário. |
| **Infra enxuta** | Usar Supabase Free + VPS compartilhada enquanto a base for pequena. |
| **WhatsApp grátis** | Manter WAHA CORE (1 sessão grátis) como padrão no plano básico. |
| **Sem suporte telefônico** | Atender por WhatsApp/e-mail/documentação, reduzindo custo operacional. |

### 8.2 Onde podemos ser mais caros, mas entregar mais valor

| Diferencial | Plano sugerido | Valor justificado |
|-------------|----------------|-------------------|
| **Mapa com CNEFE e geolocalização** | Profissional em diante | Dado estratégico que o O Assessor não oferece. |
| **Múltiplas sessões de WhatsApp** | Premium/Enterprise | Essencial para equipes grandes e campanhas. |
| **Automações e workflows** | Premium | Economiza horas da equipe. |
| **Relatórios avançados e BI** | Premium | Decisões baseadas em dados. |
| **Onboarding e suporte prioritário** | Enterprise | Vereadores grandes pagam por mão de obra. |

### 8.3 Posicionamento recomendado

> **"O Mandato Digital é o O Assessor para quem quer crescer."**

- **O Assessor:** bom para começar, simples, barato.
- **Mandato Digital:** para o vereador que quer escalar a base, usar mapa, automatizar WhatsApp e tomar decisões com dados.

---

## 9. Recomendação de Planos para o Mandato Digital

### 9.1 Estrutura de planos sugerida

| Plano | Preço mensal | Eleitores | Usuários | WhatsApp | Diferenciais | Margem estimada* |
|-------|--------------|-----------|----------|----------|--------------|------------------|
| **Iniciante** | R$ 149 | Até 1.000 | 1 | 1 sessão (WAHA CORE) | CRM, demandas, relatórios básicos | **65–75%** |
| **Profissional** | R$ 299 | Até 5.000 | Até 5 | 1 sessão + opção multi | Mapa, CNEFE, relatórios avançados | **55–65%** |
| **Campanha** | R$ 499 | Até 15.000 | Ilimitado | Até 3 sessões | Automações, BI, suporte prioritário | **50–60%** |
| **Mandato Digital Enterprise** | Sob consulta | Ilimitado | Ilimitado | Sob medida | Onboarding, customizações, SLA | **40–55%** |

\* Margem estimada considerando infra, WhatsApp e suporte proporcional ao plano.

### 9.2 Detalhamento dos limites

| Recurso | Iniciante | Profissional | Campanha | Enterprise |
|---------|-----------|--------------|----------|------------|
| Eleitores | 1.000 | 5.000 | 15.000 | Ilimitado |
| Usuários/subcontas | 1 | 5 | Ilimitado | Ilimitado |
| Sessões WhatsApp | 1 (WAHA CORE) | 1 + opção | 3 inclusas | Sob demanda |
| E-mails/mês | 1.000 | 5.000 | 15.000 | Negociado |
| SMS | Crédito pré-pago | Crédito pré-pago | Crédito pré-pago | Crédito pré-pago |
| Mapa/CNEFE | Básico | Completo | Completo | Completo |
| Automações | Não | Básico | Avançado | Avançado |
| Suporte | WhatsApp/e-mail | WhatsApp/e-mail | Prioritário | Dedicado |

### 9.3 Preço anual (desconto)

| Plano | Mensal | Anual (10% off) | Economia anual |
|-------|--------|-----------------|----------------|
| Iniciante | R$ 149 | R$ 1.610 | R$ 178 |
| Profissional | R$ 299 | R$ 3.229 | R$ 359 |
| Campanha | R$ 499 | R$ 5.389 | R$ 599 |

> O desconto anual melhora o cash flow e reduz churn.

---

## 10. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| O Assessor reagir com desconto | Média | Alto | Diferenciar por funcionalidade, não por preço. |
| Clientes acharem planos complexos | Média | Médio | Comparador simples na landing page. |
| Infra do Supabase Pro ficar cara | Baixa | Médio | Monitorar uso; otimizar queries e índices. |
| WhatsApp não-oficial ser bloqueado | Média | Alto | Oferecer migração para API oficial como upsell. |
| Suporte escalar com crescimento | Alta | Médio | Criar base de conhecimento e automatizar onboarding. |

---

## 11. Conclusão e Próximos Passos

**O Assessor é um concorrente direto de nicho, forte em preço fixo e simplicidade, mas frágil em escalabilidade e margem em clientes grandes.** O Mandato Digital não precisa competir no mesmo preço único. Pelo contrário: deve usar uma **estratégia de tiered pricing** que:

1. **Captura vereadores pequenos** com um plano Iniciante a R$ 149/mês.
2. **Monetiza crescimento** com planos Profissional (R$ 299) e Campanha (R$ 499).
3. **Protege a margem** cobrando por eleitores, usuários e sessões de WhatsApp.
4. **Diferencia** com mapa, CNEFE, automações e stack moderna.

**Próximos passos sugeridos:**

1. Validar os preços sugeridos com 3–5 vereadores potenciais.
2. Criar página de planos no site e comparativo com O Assessor.
3. Implementar limites técnicos por plano (eleitores, usuários, sessões).
4. Definir custo real de WhatsApp multi-sessão (WasenderAPI ou alternativa).
5. Estimar CAC (custo de aquisição) e LTV (lifetime value) por plano.

---

*Análise produzida para fins estratégicos. Números estimados são cenários de mercado e devem ser validados com dados reais de operação.*
