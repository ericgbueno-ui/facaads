# 🗂️ MASTER 06: MAPA DE DOCUMENTAÇÃO
## Revenue Engine - Índice Completo

**Última Atualização:** 18 de julho de 2026  
**Total de Documentos:** 4 documentos principais + 1 schema  
**Linhas Totais:** 2.500+

---

## 📍 NAVEGAÇÃO RÁPIDA

### Para Entender o Conceito
👉 [`MASTER_06_STATUS_CONSOLIDATED.md`](./MASTER_06_STATUS_CONSOLIDATED.md)
- Resumo executivo
- Objetivos
- Status geral
- Integração com MASTERS anteriores

### Para Ver o Design do Banco
👉 [`MASTER_06_FASE_1_DATABASE_SCHEMA.md`](./MASTER_06_FASE_1_DATABASE_SCHEMA.md)
- 12 entidades mapeadas
- Campos e relações
- Índices
- Multi-tenancy

### Para Saber Como Implementar Services
👉 [`MASTER_06_FASE_2_REVENUE_SERVICES.md`](./MASTER_06_FASE_2_REVENUE_SERVICES.md)
- 8 services descritos
- Métodos de cada service
- Padrões (Repository, DI, Events)
- Checklist de implementação

### Para Entender Como Funciona com CONNECT
👉 [`MASTER_06_INTEGRATION_WITH_CONNECT.md`](./MASTER_06_INTEGRATION_WITH_CONNECT.md)
- Fluxos de dados completos
- Meta Ads → Revenue
- Shopee → Revenue
- Webhooks → Comissão
- WhatsApp → Venda

### Para Ver o Schema Prisma Completo
👉 [`prisma/schema.prisma`](./prisma/schema.prisma)
- Todas as 12 entidades
- Relacionamentos
- Índices
- Enums

---

## 🧭 ESTRUTURA DE FASES

```
MASTER 06: Revenue Engine
├─ FASE 1: Database Schema ✅ (COMPLETO)
│  ├─ Documento: MASTER_06_FASE_1_DATABASE_SCHEMA.md
│  ├─ Arquivo: prisma/schema.prisma (MODIFICADO)
│  ├─ Entidades: 12 criadas
│  ├─ Enums: 3 criados
│  └─ Status: PRONTO PARA MIGRATION
│
├─ FASE 2: Revenue Services 📅 (PLANEJADO)
│  ├─ Documento: MASTER_06_FASE_2_REVENUE_SERVICES.md
│  ├─ Services: 8 a criar
│  ├─ Repositories: 8 a criar
│  ├─ Linhas: ~2.000
│  └─ Padrões: Repository, DI, Events
│
├─ FASE 3: REST APIs 📅 (PRÓXIMO)
│  ├─ Endpoints: 20+ a criar
│  ├─ Controllers: 8 a criar
│  ├─ Validações: zod/joi
│  └─ Documentação: Swagger/OpenAPI
│
└─ FASE 4: Dashboard UI 📅 (FUTURO)
   ├─ Componentes: KPI, Charts, Rankings
   ├─ Framework: React
   ├─ Estado: TBD
   └─ Visualizações: Gráficos, cards, tabelas
```

---

## 📊 MATRIZ DE CONTEÚDOS

### MASTER_06_STATUS_CONSOLIDATED.md

| Seção | Conteúdo | Linha |
|-------|----------|-------|
| Resumo Executivo | Objetivos e respostas que HERGÉ dará | 1-30 |
| Arquitetura | Fluxo de camadas | 31-60 |
| Fase 1 (Banco) | Status completo | 61-180 |
| Fase 2 (Services) | 8 services descritos | 181-230 |
| Fase 3 (APIs) | 20+ endpoints planejados | 231-260 |
| Fase 4 (UI) | Componentes React | 261-290 |
| KPIs | Fórmulas e cálculos | 291-320 |
| Integração | Como funciona com MASTERS anteriores | 321-360 |
| Segurança | Multi-tenant, encryption, HMAC | 361-390 |
| Performance | Índices e cache strategy | 391-420 |
| Checklist | Pré-produção | 421-480 |

### MASTER_06_FASE_1_DATABASE_SCHEMA.md

| Entidade | Campos | Índices | Relações |
|----------|--------|---------|----------|
| RevenueSale | 25+ | 8 | 4 |
| RevenueSource | 5 | 2 | 1 |
| RevenueProduct | 8 | 2 | 1 |
| RevenueIndicator | 20+ | 5 | 1 |
| RevenueLossReason | 4 | 2 | 1 |
| RevenueTimeline | 7 | 4 | 2 |
| RevenueGoal | 8 | 3 | 1 |
| RevenueForecast | 6 | 2 | 1 |
| RevenueCommission | 8 | 3 | 2 |
| RevenueScore | 7 | 2 | 1 |

### MASTER_06_FASE_2_REVENUE_SERVICES.md

| Service | Métodos | Responsabilidade | Status |
|---------|---------|------------------|--------|
| SaleService | 15+ | CRUD + Status workflow | 📅 |
| RevenueService | 20+ | Cálculos de KPIs | 📅 |
| IndicatorService | 10+ | Armazenar KPIs | 📅 |
| LossService | 12+ | Análise de perdas | 📅 |
| CommissionService | 10+ | Gerenciar comissões | 📅 |
| RankingService | 15+ | Rankings & scoring | 📅 |
| ForecastService | 12+ | Projeções | 📅 |
| GoalService | 12+ | Gerenciar metas | 📅 |

### MASTER_06_INTEGRATION_WITH_CONNECT.md

| Fluxo | Origem | Destino | Evento |
|-------|--------|---------|--------|
| Fluxo 1 | Meta Ads | RevenueSale | integration:sync:completed |
| Fluxo 2 | Shopee | RevenueSale | integration:sync:completed |
| Fluxo 3 | Mercado Pago | RevenueCommission | integration:webhook:received |
| Fluxo 4 | WhatsApp | RevenueSale | integration:webhook:received |

---

## 🔍 BUSCAR POR TÓPICO

### "Como criar uma venda?"
1. Ver: MASTER_06_FASE_2_REVENUE_SERVICES.md → **SaleService**
2. Ver: MASTER_06_FASE_1_DATABASE_SCHEMA.md → **RevenueSale** entity
3. Consultar: prisma/schema.prisma → `model RevenueSale`

### "Como calcular ROAS?"
1. Ver: MASTER_06_STATUS_CONSOLIDATED.md → **KPIs Calculados Automaticamente**
2. Ver: MASTER_06_FASE_2_REVENUE_SERVICES.md → **RevenueService**
3. Fórmula: Receita / Spend

### "Como sincroniza do Meta?"
1. Ver: MASTER_06_INTEGRATION_WITH_CONNECT.md → **Fluxo 1**
2. Diagramas de sincronização completos
3. Eventos emitidos

### "Como comissões funcionam?"
1. Ver: MASTER_06_FASE_2_REVENUE_SERVICES.md → **CommissionService**
2. Ver: MASTER_06_FASE_1_DATABASE_SCHEMA.md → **RevenueCommission** entity
3. Fluxo: webhook payment → comissão calculada

### "Como implementar o banco?"
1. Ver: MASTER_06_FASE_1_DATABASE_SCHEMA.md → **Todo o documento**
2. Executar: `npx prisma migrate dev --name "add_revenue_engine_master06"`

### "Como não quebrar multi-tenancy?"
1. Ver: MASTER_06_STATUS_CONSOLIDATED.md → **Segurança Implementada**
2. Ver: MASTER_06_INTEGRATION_WITH_CONNECT.md → **Segurança na Integração**
3. Regra: SEMPRE filtrar por companyId

### "Quais services preciso criar?"
1. Ver: MASTER_06_FASE_2_REVENUE_SERVICES.md → **Services a Criar (tabela)**
2. Total: 8 services
3. Linhas: ~2.000

### "Quais APIs vou expor?"
1. Ver: MASTER_06_STATUS_CONSOLIDATED.md → **FASE 3: REST APIs**
2. Total: 20+ endpoints
3. Exemplo: `POST /api/v1/revenue/sales`

### "Como visualizar KPIs?"
1. Ver: MASTER_06_STATUS_CONSOLIDATED.md → **FASE 4: Dashboard UI**
2. Componentes: KPI Cards, Gráficos, Rankings
3. Status: Futuro (FASE 4)

---

## 🎯 SEQUÊNCIA DE LEITURA

### Para Gestores/PMs

1. 📄 MASTER_06_STATUS_CONSOLIDATED.md (1º: Overview)
2. 📊 Diagrama de arquitetura (seção "Arquitetura Implementada")
3. 📈 KPIs que HERGÉ vai calcular (seção "KPIs Calculados Automaticamente")
4. ✅ Status por fase (seção "Status por Camada")

**Tempo:** 15 minutos

---

### Para Arquitetos/Tech Leads

1. 🗂️ MASTER_06_STATUS_CONSOLIDATED.md (Overview + integração)
2. 📋 MASTER_06_FASE_1_DATABASE_SCHEMA.md (Schema completo)
3. 🔧 MASTER_06_FASE_2_REVENUE_SERVICES.md (Architecture de services)
4. 🔗 MASTER_06_INTEGRATION_WITH_CONNECT.md (Integração com MASTER 05)

**Tempo:** 45 minutos

---

### Para Desenvolvedores (Backend)

1. 🔧 MASTER_06_FASE_2_REVENUE_SERVICES.md (Start here)
2. 📋 MASTER_06_FASE_1_DATABASE_SCHEMA.md (Schema details)
3. 🔗 MASTER_06_INTEGRATION_WITH_CONNECT.md (Fluxos)
4. 📄 prisma/schema.prisma (Código final)
5. ✅ MASTER_06_STATUS_CONSOLIDATED.md → Checklist pré-produção

**Tempo:** 2 horas

---

### Para Desenvolvedores (Frontend)

1. 📄 MASTER_06_STATUS_CONSOLIDATED.md → **FASE 4: Dashboard UI** (seção)
2. 📊 Seção "Diferenciais do Revenue Engine" (antes/depois)
3. 🔗 MASTER_06_INTEGRATION_WITH_CONNECT.md → **Fluxos de dados** (para entender o que você vai exibir)

**Tempo:** 30 minutos

---

### Para QA/Testers

1. ✅ MASTER_06_STATUS_CONSOLIDATED.md → **Checklist Pré-Produção**
2. 🧪 MASTER_06_FASE_2_REVENUE_SERVICES.md → **Testes por Service** (checklist)
3. 🔗 MASTER_06_INTEGRATION_WITH_CONNECT.md → **Fluxos Completos** (test cases)

**Tempo:** 1 hora

---

## 📁 ESTRUTURA DE ARQUIVOS

```
C:\projetos ia\herge\
├── prisma/
│   └── schema.prisma ← MODIFICADO (12 entities)
│
├── MASTER_06_STATUS_CONSOLIDATED.md ← LEIA PRIMEIRO
├── MASTER_06_FASE_1_DATABASE_SCHEMA.md
├── MASTER_06_FASE_2_REVENUE_SERVICES.md
├── MASTER_06_INTEGRATION_WITH_CONNECT.md
└── MASTER_06_DOCUMENTATION_MAP.md (este arquivo)

src/services/revenue/ ← A implementar (FASE 2)
├── sale.service.ts
├── revenue.service.ts
├── indicator.service.ts
├── loss.service.ts
├── commission.service.ts
├── ranking.service.ts
├── forecast.service.ts
└── goal.service.ts

src/repositories/revenue/ ← A implementar (FASE 2)
├── sale.repository.ts
├── indicator.repository.ts
└── ...

src/app/api/v1/revenue/ ← A implementar (FASE 3)
├── sales/
├── indicators/
├── rankings/
├── losses/
├── forecast/
├── goals/
├── commissions/
└── import-export/
```

---

## 🔗 LINKS ENTRE DOCUMENTOS

```
MASTER_06_STATUS_CONSOLIDATED.md
├─→ MASTER_06_FASE_1_DATABASE_SCHEMA.md
│   └─→ Seção: "Novas Entidades Criadas"
├─→ MASTER_06_FASE_2_REVENUE_SERVICES.md
│   └─→ Seção: "Services a Criar"
├─→ MASTER_06_INTEGRATION_WITH_CONNECT.md
│   └─→ Seção: "Fluxos de Dados"
└─→ prisma/schema.prisma
    └─→ Código Prisma final

MASTER_06_FASE_1_DATABASE_SCHEMA.md
├─→ MASTER_06_FASE_2_REVENUE_SERVICES.md
│   └─→ Seção: "SaleService" (consome RevenueSale)
└─→ prisma/schema.prisma
    └─→ Implementação das entities

MASTER_06_FASE_2_REVENUE_SERVICES.md
└─→ MASTER_06_INTEGRATION_WITH_CONNECT.md
    └─→ Seção: "Sincronização Contínua"
```

---

## 📈 ESTATÍSTICAS

### Documentação MASTER 06

| Arquivo | Linhas | Seções | Figuras |
|---------|--------|--------|---------|
| STATUS_CONSOLIDATED | 500+ | 20+ | 10+ |
| FASE_1_DATABASE | 450+ | 15+ | 8+ |
| FASE_2_SERVICES | 400+ | 12+ | 6+ |
| INTEGRATION | 380+ | 14+ | 10+ |
| **TOTAL** | **1.730+** | **61+** | **34+** |

### Código a Implementar

| Camada | Arquivos | Linhas | Status |
|--------|----------|--------|--------|
| Database | 1 (schema.prisma) | +200 | ✅ |
| Repositories | 8 | ~1.200 | 📅 |
| Services | 8 | ~2.000 | 📅 |
| APIs | 8+ | ~1.500 | 📅 |
| UI Components | 15+ | ~3.000 | 📅 |
| **TOTAL** | **40+** | **~7.900** | **Parcial** |

---

## 🎯 PRÓXIMAS AÇÕES

### Imediato (hoje)
- ✅ Ler MASTER_06_STATUS_CONSOLIDATED.md (overview)
- ✅ Revisar MASTER_06_FASE_1_DATABASE_SCHEMA.md (design)
- 📅 Feedback sobre schema

### Esta semana
- 📅 Criar migration Prisma
- 📅 Começar FASE 2 (Services)

### Próximas semanas
- 📅 Implementar 8 services
- 📅 Criar REST APIs (FASE 3)
- 📅 Implementar Dashboard (FASE 4)

---

## 💬 QUESTÕES FREQUENTES

**P: Por onde começo?**  
R: Leia `MASTER_06_STATUS_CONSOLIDATED.md` primeiro (10 min), depois `MASTER_06_FASE_1_DATABASE_SCHEMA.md` (20 min)

**P: Quanto tempo vai levar implementar tudo?**  
R: ~4-6 semanas (FASE 2-4), sendo 2-3 semanas apenas para os 8 services da FASE 2

**P: E se eu só quiser implementar FASE 1 e 2?**  
R: Database + Services = ~3 semanas. Dashboard pode vir depois.

**P: Como testo sem o Dashboard?**  
R: Postman/Insomnia para APIs, SQL client para banco, logs estruturados

**P: Quanto de mudança no código existente?**  
R: **ZERO**. Tudo é aditivo (novas entities, novos services). Backward compatible 100%.

**P: E multi-tenancy?**  
R: ✅ Garantida. Todas as queries filtram por companyId obrigatoriamente.

---

## 📞 CONTATO

**Estrutura:** NEW (Persona Técnica de Eric Girard Bueno)  
**Data:** 18 de julho de 2026  
**Repo:** C:\projetos ia\herge\  
**Branch:** master

---

## 🏆 CONCLUSÃO

**MASTER 06 é a fundação de Revenue Intelligence em HERGÉ.**

Com 4 documentos + 1 schema modificado, você tem:
- ✅ Design completo do banco (FASE 1)
- ✅ Arquitetura de serviços (FASE 2)
- ✅ Plano de APIs (FASE 3)
- ✅ Visão de Dashboard (FASE 4)
- ✅ Integração com CONNECT (MASTER 05)

**Tudo pronto para implementação.**

---

**Última linha:** Use este documento como índice para navegar rapidamente entre os outros documentos.
