# 🚀 MASTER 03: CRM ENTERPRISE IMPLEMENTATION PLAN
**Status:** Design Complete  
**Objetivo:** Implementar CRM Enterprise Multi-Segmento  
**Tempo Estimado:** 120-160 horas full-time development  
**Recomendação:** 8-10 dias focados  
**Desvio:** 15-20% para testes e otimizações

---

## 📋 RESUMO EXECUTIVO

O MASTER 03 implementará um **CRM Enterprise extremamente flexível** que:
- ✅ Atende qualquer segmento de mercado
- ✅ Sem customização de código
- ✅ Com 14+ módulos CRM
- ✅ 100+ endpoints de API
- ✅ 15+ páginas frontend
- ✅ Integrado com CORE do MASTER 02

**Zero alterações** na arquitetura dos MASTER 01 e MASTER 02.

---

## 🎯 FASES DE IMPLEMENTAÇÃO

### FASE 1: DATABASE EXPANSION (6-8 horas)

#### 1.1: Migrations Prisma
**Arquivos:**
- `prisma/migrations/[timestamp]_add_crm_company/migration.sql`
- `prisma/migrations/[timestamp]_add_crm_contact/migration.sql`
- `prisma/migrations/[timestamp]_add_crm_lead/migration.sql`
- `prisma/migrations/[timestamp]_add_crm_business/migration.sql`
- `prisma/migrations/[timestamp]_add_crm_pipeline/migration.sql`
- `prisma/migrations/[timestamp]_add_crm_activity/migration.sql`
- `prisma/migrations/[timestamp]_add_crm_product/migration.sql`
- `prisma/migrations/[timestamp]_add_crm_tag/migration.sql`
- `prisma/migrations/[timestamp]_add_crm_customfield/migration.sql`
- `prisma/migrations/[timestamp]_add_crm_document/migration.sql`
- `prisma/migrations/[timestamp]_add_crm_log/migration.sql`

#### 1.2: Tarefas
- [ ] Adicionar 10+ modelos ao schema.prisma
- [ ] Criar índices estratégicos
- [ ] Definir relacionamentos
- [ ] Gerar Prisma Client
- [ ] `npx prisma migrate dev`
- [ ] Validar banco

**Tempo:** 6-8 horas  
**Commits:** 1 ("feat: Add CRM database models with 10+ tables")

---

### FASE 2: COMPANY SERVICE (8-10 horas)

#### 2.1: Company Service
**Arquivo:** `src/modules/crm/services/company.service.ts`

**Métodos:**
```typescript
class CompanyService {
  async create(companyId, data)
  async getById(companyId, id)
  async list(companyId, filters)
  async update(companyId, id, data)
  async delete(companyId, id)
  async uploadLogo(companyId, id, file)
  async search(companyId, query)
  async getTimeline(companyId, id)
  async addTag(companyId, id, tagId)
  async removeTag(companyId, id, tagId)
}
```

#### 2.2: Company Repository
**Arquivo:** `src/modules/crm/repositories/company.repository.ts`

#### 2.3: Company Validator
**Arquivo:** `src/modules/crm/validators/company.validator.ts`

#### 2.4: API Endpoints
**Arquivos:**
- `src/app/api/v1/crm/companies/route.ts`
- `src/app/api/v1/crm/companies/[id]/route.ts`
- `src/app/api/v1/crm/companies/[id]/logo/route.ts`
- `src/app/api/v1/crm/companies/search/route.ts`

#### 2.5: Testes Manuais
- [ ] CRUD completo de empresas
- [ ] Upload de logo
- [ ] Pesquisa funciona
- [ ] Timeline carregando

**Tempo:** 8-10 horas  
**Commits:** 2 ("feat: Implement company service", "feat: Add company API endpoints")

---

### FASE 3: CONTACT SERVICE (6-8 horas)

#### 3.1: Contact Service
**Arquivo:** `src/modules/crm/services/contact.service.ts`

#### 3.2: Contact Repository
**Arquivo:** `src/modules/crm/repositories/contact.repository.ts`

#### 3.3: API Endpoints
**Arquivos:**
- `src/app/api/v1/crm/contacts/route.ts`
- `src/app/api/v1/crm/contacts/[id]/route.ts`
- `src/app/api/v1/crm/contacts/search/route.ts`

#### 3.4: Testes
- [ ] CRUD de contatos
- [ ] Link com empresa
- [ ] Pesquisa funciona

**Tempo:** 6-8 horas  
**Commits:** 1 ("feat: Implement contact service and API")

---

### FASE 4: LEAD SERVICE (10-12 horas)

#### 4.1: Lead Service
**Arquivo:** `src/modules/crm/services/lead.service.ts`

**Métodos:**
```typescript
class LeadService {
  async create(companyId, data)
  async getById(companyId, id)
  async list(companyId, filters)
  async update(companyId, id, data)
  async delete(companyId, id)
  async moveToStage(companyId, id, stageId)
  async convertToBusiness(companyId, id)
  async convertToContact(companyId, id)
  async search(companyId, query)
  async bulkUpdate(companyId, ids, updates)
  async getByPipeline(companyId, pipelineId)
  async addTag(companyId, id, tagId)
}
```

#### 4.2: Lead Repository
**Arquivo:** `src/modules/crm/repositories/lead.repository.ts`

#### 4.3: API Endpoints
**Arquivos:**
- `src/app/api/v1/crm/leads/route.ts`
- `src/app/api/v1/crm/leads/[id]/route.ts`
- `src/app/api/v1/crm/leads/[id]/stage/route.ts`
- `src/app/api/v1/crm/leads/search/route.ts`
- `src/app/api/v1/crm/leads/pipeline/[id]/route.ts`
- `src/app/api/v1/crm/leads/bulk-update/route.ts`

#### 4.4: Testes
- [ ] CRUD de leads
- [ ] Mover entre estágios
- [ ] Converter para negócio
- [ ] Pesquisa funciona
- [ ] Tags funcionam

**Tempo:** 10-12 horas  
**Commits:** 2 ("feat: Implement lead service", "feat: Add lead API with stage management")

---

### FASE 5: BUSINESS SERVICE (8-10 horas)

#### 5.1: Business Service
**Arquivo:** `src/modules/crm/services/business.service.ts`

#### 5.2: Business Repository
**Arquivo:** `src/modules/crm/repositories/business.repository.ts`

#### 5.3: API Endpoints
**Arquivos:**
- `src/app/api/v1/crm/business/route.ts`
- `src/app/api/v1/crm/business/[id]/route.ts`
- `src/app/api/v1/crm/business/[id]/stage/route.ts`
- `src/app/api/v1/crm/business/[id]/won/route.ts`
- `src/app/api/v1/crm/business/[id]/lost/route.ts`
- `src/app/api/v1/crm/business/pipeline/[id]/route.ts`

**Tempo:** 8-10 horas  
**Commits:** 1 ("feat: Implement business service and API")

---

### FASE 6: PIPELINE SERVICE (8-10 horas)

#### 6.1: Pipeline Service
**Arquivo:** `src/modules/crm/services/pipeline.service.ts`

#### 6.2: Pipeline Stage Service
**Arquivo:** `src/modules/crm/services/pipeline-stage.service.ts`

#### 6.3: API Endpoints
**Arquivos:**
- `src/app/api/v1/crm/pipelines/route.ts`
- `src/app/api/v1/crm/pipelines/[id]/route.ts`
- `src/app/api/v1/crm/pipelines/[id]/stages/route.ts`
- `src/app/api/v1/crm/pipelines/[id]/stages/[stageId]/route.ts`

**Tempo:** 8-10 horas  
**Commits:** 1 ("feat: Implement pipeline service with dynamic stages")

---

### FASE 7: ACTIVITY & PRODUCTS (6-8 horas)

#### 7.1: Activity Service
**Arquivo:** `src/modules/crm/services/activity.service.ts`

#### 7.2: Product Service
**Arquivo:** `src/modules/crm/services/product.service.ts`

#### 7.3: API Endpoints
**Arquivos:**
- `src/app/api/v1/crm/activities/route.ts`
- `src/app/api/v1/crm/products/route.ts`

**Tempo:** 6-8 horas  
**Commits:** 1 ("feat: Implement activity and product services")

---

### FASE 8: CUSTOM FIELDS & TAGS (8-10 horas)

#### 8.1: Custom Field Service
**Arquivo:** `src/modules/crm/services/customfield.service.ts`

#### 8.2: Tag Service
**Arquivo:** `src/modules/crm/services/tag.service.ts`

#### 8.3: Filter Service
**Arquivo:** `src/modules/crm/services/filter.service.ts`

#### 8.4: API Endpoints
**Arquivos:**
- `src/app/api/v1/crm/fields/route.ts`
- `src/app/api/v1/crm/tags/route.ts`
- `src/app/api/v1/crm/filters/route.ts`

**Tempo:** 8-10 horas  
**Commits:** 1 ("feat: Implement custom fields, tags, and filters")

---

### FASE 9: IMPORT/EXPORT & LOGGING (6-8 horas)

#### 9.1: Import Service
**Arquivo:** `src/modules/crm/services/import.service.ts`

#### 9.2: Export Service
**Arquivo:** `src/modules/crm/services/export.service.ts`

#### 9.3: Log Service
**Arquivo:** `src/modules/crm/services/log.service.ts`

#### 9.4: API Endpoints
**Arquivos:**
- `src/app/api/v1/crm/import/route.ts`
- `src/app/api/v1/crm/export/route.ts`
- `src/app/api/v1/crm/logs/route.ts`

**Tempo:** 6-8 horas  
**Commits:** 1 ("feat: Implement import, export, and logging")

---

### FASE 10: REACT HOOKS (8-10 horas)

#### 10.1: Custom Hooks
**Arquivos:**
- `src/modules/crm/hooks/useCompanies.ts`
- `src/modules/crm/hooks/useContacts.ts`
- `src/modules/crm/hooks/useLeads.ts`
- `src/modules/crm/hooks/useBusiness.ts`
- `src/modules/crm/hooks/usePipelines.ts`
- `src/modules/crm/hooks/useActivities.ts`
- `src/modules/crm/hooks/useCustomFields.ts`
- `src/modules/crm/hooks/useFilters.ts`
- `src/modules/crm/hooks/useTags.ts`
- `src/modules/crm/hooks/useTimeline.ts`

**Tempo:** 8-10 horas  
**Commits:** 1 ("feat: Implement CRM React hooks")

---

### FASE 11: CRM COMPONENTS (12-16 horas)

#### 11.1: Company Components
**Arquivos:**
- `src/modules/crm/components/company/CompanyCard.tsx`
- `src/modules/crm/components/company/CompanyForm.tsx`
- `src/modules/crm/components/company/CompanyList.tsx`
- `src/modules/crm/components/company/CompanyDetail.tsx`

#### 11.2: Lead Components
**Arquivos:**
- `src/modules/crm/components/lead/LeadKanban.tsx`
- `src/modules/crm/components/lead/LeadTable.tsx`
- `src/modules/crm/components/lead/LeadForm.tsx`
- `src/modules/crm/components/lead/LeadDetail.tsx`

#### 11.3: Other Components
**Arquivos:**
- `src/modules/crm/components/contact/ContactForm.tsx`
- `src/modules/crm/components/business/BusinessKanban.tsx`
- `src/modules/crm/components/activity/ActivityForm.tsx`
- `src/modules/crm/components/pipeline/PipelineConfig.tsx`
- `src/modules/crm/components/timeline/Timeline.tsx`
- `src/modules/crm/components/document/DocumentUpload.tsx`

**Tempo:** 12-16 horas  
**Commits:** 2 ("feat: Add CRM components", "feat: Add CRM forms and detail views")

---

### FASE 12: PAGES (15-20 horas)

#### 12.1: Dashboard & Company Pages
**Arquivos:**
- `src/app/(authenticated)/crm/page.tsx` - Dashboard
- `src/app/(authenticated)/crm/companies/page.tsx` - Lista
- `src/app/(authenticated)/crm/companies/[id]/page.tsx` - Detalhe
- `src/app/(authenticated)/crm/companies/[id]/edit/page.tsx` - Editar

#### 12.2: Contact Pages
**Arquivos:**
- `src/app/(authenticated)/crm/contacts/page.tsx`
- `src/app/(authenticated)/crm/contacts/[id]/page.tsx`
- `src/app/(authenticated)/crm/contacts/new/page.tsx`

#### 12.3: Lead Pages
**Arquivos:**
- `src/app/(authenticated)/crm/leads/page.tsx` - Kanban
- `src/app/(authenticated)/crm/leads/table/page.tsx` - Table
- `src/app/(authenticated)/crm/leads/[id]/page.tsx` - Detalhe

#### 12.4: Business Pages
**Arquivos:**
- `src/app/(authenticated)/crm/business/page.tsx` - Kanban
- `src/app/(authenticated)/crm/business/[id]/page.tsx` - Detalhe
- `src/app/(authenticated)/crm/business/[id]/documents/page.tsx` - Docs

#### 12.5: Settings Pages
**Arquivos:**
- `src/app/(authenticated)/crm/settings/fields/page.tsx`
- `src/app/(authenticated)/crm/settings/pipelines/page.tsx`
- `src/app/(authenticated)/crm/settings/tags/page.tsx`
- `src/app/(authenticated)/crm/settings/import-export/page.tsx`

#### 12.6: Other Pages
**Arquivos:**
- `src/app/(authenticated)/crm/activities/page.tsx`
- `src/app/(authenticated)/crm/activities/calendar/page.tsx`
- `src/app/(authenticated)/crm/products/page.tsx`

**Tempo:** 15-20 horas  
**Commits:** 4 ("feat: Add CRM pages (dashboard, companies)", "feat: Add leads and business pages", "feat: Add activity and settings pages", "feat: Add calendar and product pages")

---

### FASE 13: CRM DASHBOARD (6-8 horas)

#### 13.1: Dashboard Widgets
**Arquivo:** `src/modules/crm/components/dashboard/`

**Widgets:**
- Lead by stage (barchart)
- Business by value (pie)
- Conversion rate (line)
- Activities (list)
- Revenue forecast (line)
- Pipeline overview (cards)
- Activity heatmap

#### 13.2: Empty States
- Elegantes e informativos
- Nunca dados fictícios
- Links para criar novo

**Tempo:** 6-8 horas  
**Commits:** 1 ("feat: Implement CRM dashboard with real data widgets")

---

### FASE 14: TESTES (12-16 horas)

#### 14.1: Unit Tests
**Arquivos:**
- `src/modules/crm/services/*.service.test.ts` (10+ files)

#### 14.2: Integration Tests
**Arquivos:**
- `src/__tests__/e2e/crm-company.test.ts`
- `src/__tests__/e2e/crm-lead.test.ts`
- `src/__tests__/e2e/crm-business.test.ts`
- `src/__tests__/e2e/crm-pipeline.test.ts`

#### 14.3: E2E Tests
- Criar empresa → lead → negócio → venda
- Mover lead entre estágios
- Criar campo personalizado
- Import de leads
- Export de dados

**Tempo:** 12-16 horas  
**Commits:** 2 ("test: Add CRM unit and integration tests", "test: Add CRM E2E test suite")

---

### FASE 15: DOCUMENTATION (8-10 horas)

#### 15.1: API Documentation
**Arquivo:** `docs/CRM_API.md`

#### 15.2: Architecture Docs
**Arquivo:** `docs/CRM_ARCHITECTURE.md`

#### 15.3: Field Mappings
**Arquivo:** `docs/CRM_FIELD_MAPPINGS.md`

#### 15.4: Permission Matrix
**Arquivo:** `docs/CRM_PERMISSIONS.md`

#### 15.5: Segment Configs
**Arquivo:** `docs/CRM_SEGMENT_CONFIGS.md`

**Tempo:** 8-10 horas  
**Commits:** 1 ("docs: Add CRM documentation")

---

### FASE 16: PERFORMANCE & OPTIMIZATION (8-10 horas)

#### 16.1: Database Optimization
- [ ] Análise de queries lentas
- [ ] Criação de índices adicionais
- [ ] Otimização de joins
- [ ] Connection pooling

#### 16.2: Frontend Optimization
- [ ] Lazy loading de componentes
- [ ] Code splitting
- [ ] Caching de dados
- [ ] Debouncing de buscas

#### 16.3: API Optimization
- [ ] Paginação implementada
- [ ] Select de campos específicos
- [ ] Cache de responses
- [ ] Rate limiting

**Tempo:** 8-10 horas  
**Commits:** 1 ("perf: Optimize CRM queries and frontend loading")

---

### FASE 17: FINAL VERIFICATION (4-6 horas)

#### 17.1: Checklist Final
- [ ] `npm run build` sem erros
- [ ] Sem TypeScript warnings
- [ ] 70%+ test coverage
- [ ] Todos endpoints testados
- [ ] Performance validada
- [ ] Security checklist
- [ ] Mobile responsiveness

#### 17.2: Testes Manuais
- [ ] Fluxo completo funciona
- [ ] Dados reais aparecem
- [ ] Empty states elegantes
- [ ] Permissões funcionam
- [ ] Import/export funciona

**Tempo:** 4-6 horas

---

## 📊 TIMELINE TOTAL

| Fase | Tarefa | Tempo | Status |
|------|--------|-------|--------|
| 1 | Database | 6-8h | ⏳ |
| 2 | Company Service | 8-10h | ⏳ |
| 3 | Contact Service | 6-8h | ⏳ |
| 4 | Lead Service | 10-12h | ⏳ |
| 5 | Business Service | 8-10h | ⏳ |
| 6 | Pipeline Service | 8-10h | ⏳ |
| 7 | Activity/Products | 6-8h | ⏳ |
| 8 | Fields/Tags | 8-10h | ⏳ |
| 9 | Import/Export | 6-8h | ⏳ |
| 10 | React Hooks | 8-10h | ⏳ |
| 11 | Components | 12-16h | ⏳ |
| 12 | Pages | 15-20h | ⏳ |
| 13 | Dashboard | 6-8h | ⏳ |
| 14 | Tests | 12-16h | ⏳ |
| 15 | Documentation | 8-10h | ⏳ |
| 16 | Performance | 8-10h | ⏳ |
| 17 | Verification | 4-6h | ⏳ |
| **TOTAL** | | **140-180h** | |

**Tempo Real (com breaks, debugging):** 8-10 dias full-time

---

## 🎯 PRÓXIMO PASSO

Após MASTER 03 estar completo:

**MASTER 04:** Integrações e Automações
- Event Bus (comunicação entre módulos)
- Integrações (WhatsApp, Marketing, Financeiro, BI)
- Workflows e Automações
- Gatilhos e Ações

---

**Status:** ✅ READY FOR IMPLEMENTATION
