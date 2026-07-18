# ✅ MASTER 01: CHECKLIST COMPLETA

**Versão:** 1.0  
**Data:** 2026-07-18  
**Status:** READY FOR IMPLEMENTATION

---

## 📋 PRÉ-IMPLEMENTAÇÃO

- [ ] Ler `MASTER_01_AUDIT_REPORT.md` (30 min)
- [ ] Ler `MASTER_01_IMPLEMENTATION_PLAN.md` (45 min)
- [ ] Ler `MASTER_01_QUICK_START.md` (20 min)
- [ ] Criar branch `master-01-enterprise-refactor`
- [ ] Verificar `npm run build` passou (antes de começar)
- [ ] Testar endpoints principais (antes de começar)

---

## 🎯 FASE 1: ESTRUTURA MODULAR (2-3 horas)

### Criar Diretórios
```bash
# Core
mkdir -p src/core/auth
mkdir -p src/core/tenant
mkdir -p src/core/permissions
mkdir -p src/core/audit
mkdir -p src/core/config
mkdir -p src/core/types

# Modules
mkdir -p src/modules/ads/services
mkdir -p src/modules/ads/repositories
mkdir -p src/modules/crm/services
mkdir -p src/modules/crm/repositories
mkdir -p src/modules/whatsapp/services
mkdir -p src/modules/whatsapp/repositories
mkdir -p src/modules/financeiro/services
mkdir -p src/modules/financeiro/repositories
mkdir -p src/modules/integrations/services
mkdir -p src/modules/integrations/repositories
mkdir -p src/modules/reports/services
mkdir -p src/modules/reports/repositories

# Shared
mkdir -p src/shared/components/ui
mkdir -p src/shared/components/layout
mkdir -p src/shared/components/common
mkdir -p src/shared/hooks
mkdir -p src/shared/utils
mkdir -p src/shared/constants
mkdir -p src/shared/types
mkdir -p src/shared/styles

# Services
mkdir -p src/services/event-bus
mkdir -p src/services/cache
mkdir -p src/services/notifications
mkdir -p src/services/logging

# Repositories
mkdir -p src/repositories
```

### Criar Arquivos Index
- [ ] `src/core/index.ts` - Re-exportar tudo
- [ ] `src/modules/index.ts` - Re-exportar tudo
- [ ] `src/shared/index.ts` - Re-exportar tudo
- [ ] `src/services/index.ts` - Re-exportar tudo
- [ ] `src/repositories/index.ts` - Re-exportar tudo

### Atualizar TypeScript Config
- [ ] Adicionar paths em `tsconfig.json`:
  - `@core/*`
  - `@modules/*`
  - `@shared/*`
  - `@services/*`
  - `@repositories/*`

### Commit
- [ ] `git add .`
- [ ] `git commit -m "chore: Create modular architecture structure"`
- [ ] Verificar `npm run build` passa

---

## 🔄 FASE 2: SERVICE LAYER (10-14 horas)

### 2.1: Auth Service (2 hours)

#### Criar Files
- [ ] `src/core/auth/types.ts` - Tipos de auth
- [ ] `src/core/auth/service.ts` - AuthService
- [ ] `src/core/auth/middleware.ts` - Middleware (move do lib/)
- [ ] `src/core/auth/index.ts` - Exports

#### Tarefas
- [ ] Extrair `validateCredentials` de `lib/auth.ts` → `AuthService`
- [ ] Extrair `validateCompanyAccess` de `lib/auth-middleware.ts` → `AuthService`
- [ ] Mover middleware de auth → `core/auth/middleware.ts`
- [ ] Atualizar imports em `lib/auth.ts` para reexportar de core/
- [ ] Build deve passar

#### Teste
- [ ] Login na UI deve funcionar
- [ ] Protected routes devem redirecionar para login

### 2.2: Tenant Service (1 hour)

#### Criar Files
- [ ] `src/core/tenant/service.ts` - TenantService
- [ ] `src/core/tenant/middleware.ts` - Tenant validation
- [ ] `src/core/tenant/types.ts` - Tipos
- [ ] `src/core/tenant/index.ts` - Exports

#### Tarefas
- [ ] Criar TenantService com `getCompanyContext(userId, companyId)`
- [ ] Criar middleware para validar tenant em requests
- [ ] Usar em todas as APIs

### 2.3: Company Service (2 hours)

#### Criar Files
- [ ] `src/modules/crm/services/company.service.ts`
- [ ] `src/modules/crm/services/index.ts`

#### Tarefas
- [ ] Extrair lógica de `/api/v1/companies` → `CompanyService`
- [ ] Implementar métodos:
  - `getById(id, context)`
  - `listByUser(userId)`
  - `create(data, userId)`
  - `update(id, data, context)`
  - `delete(id, context)`
- [ ] Atualizar endpoints para usar service
- [ ] Testes manuais: CRUD companies

### 2.4: Lead Service (2 hours)

#### Criar Files
- [ ] `src/modules/crm/services/lead.service.ts`
- [ ] `src/modules/crm/validators.ts` - Zod schemas

#### Tarefas
- [ ] Extrair lógica de `/api/v1/companies/[id]/leads` → `LeadService`
- [ ] Implementar:
  - `create(companyId, data, context)`
  - `update(companyId, leadId, data, context)`
  - `list(companyId, filters)`
  - `getById(companyId, leadId)`
  - `delete(companyId, leadId, context)`
- [ ] Adicionar validadores Zod para Lead
- [ ] Atualizar endpoints
- [ ] Testes: CRUD leads

### 2.5: Sale Service (2 hours)

#### Criar Files
- [ ] `src/modules/financeiro/services/sale.service.ts`
- [ ] `src/modules/financeiro/validators.ts`

#### Tarefas
- [ ] Extrair lógica de `/api/v1/companies/[id]/sales` → `SaleService`
- [ ] Implementar:
  - `create(companyId, data, context)`
  - `update(companyId, saleId, data, context)`
  - `list(companyId, filters, pagination)`
  - `getById(companyId, saleId)`
  - `delete(companyId, saleId, context)`
  - `export(companyId, format)`
  - `getReport(companyId, period)`
- [ ] Adicionar validadores
- [ ] Atualizar endpoints
- [ ] Testes: CRUD sales, export

### 2.6: Integration Service (2 hours)

#### Criar Files
- [ ] `src/modules/integrations/services/integration.service.ts`
- [ ] `src/modules/integrations/validators.ts`

#### Tarefas
- [ ] Extrair lógica de integrações
- [ ] Implementar:
  - `create(companyId, type, config)`
  - `update(companyId, integrationType, config)`
  - `getStatus(companyId, integrationType)`
  - `sync(companyId, integrationType)`
- [ ] Atualizar endpoints

### 2.7: Ad Sync Service (3 hours)

#### Criar Files
- [ ] `src/modules/ads/services/sync.service.ts`
- [ ] `src/modules/ads/services/meta.service.ts`
- [ ] `src/modules/ads/services/google.service.ts`
- [ ] `src/modules/ads/services/tiktok.service.ts`
- [ ] `src/modules/ads/services/shopee.service.ts`
- [ ] `src/modules/ads/types.ts`

#### Tarefas
- [ ] Consolidar `lib/ads/sync.ts` + channels
- [ ] Criar factory pattern para cada channel
- [ ] Implementar sync logic em AdSyncService
- [ ] Usar em `/api/cron/sync-*`
- [ ] Mover `lib/ads/*` → `modules/ads/services/`

### Commits FASE 2
- [ ] `git commit -m "refactor: Extract auth service layer"`
- [ ] `git commit -m "refactor: Extract company service layer"`
- [ ] `git commit -m "refactor: Extract lead and sale services"`
- [ ] `git commit -m "refactor: Extract integration service"`
- [ ] `git commit -m "refactor: Extract and consolidate ad sync service"`
- [ ] Verificar `npm run build` passa

### Testes FASE 2
- [ ] GET /api/v1/companies (autenticado)
- [ ] POST /api/v1/companies (criar empresa)
- [ ] GET /api/v1/companies/[id]/leads
- [ ] POST /api/v1/companies/[id]/leads (criar lead)
- [ ] GET /api/v1/companies/[id]/sales
- [ ] POST /api/v1/companies/[id]/sales (criar venda)
- [ ] GET /dashboard (renderizar)

---

## 📚 FASE 3: REPOSITORY PATTERN (4-5 horas)

### Criar Base Repository
- [ ] `src/repositories/base.repository.ts` - Classe base

### Criar Repositories
- [ ] `src/repositories/company.repository.ts`
- [ ] `src/repositories/user.repository.ts`
- [ ] `src/repositories/lead.repository.ts`
- [ ] `src/repositories/sale.repository.ts`
- [ ] `src/repositories/campaign.repository.ts`
- [ ] `src/repositories/ad-account.repository.ts`
- [ ] `src/repositories/conversion.repository.ts`
- [ ] `src/repositories/whatsapp-conversation.repository.ts`
- [ ] `src/repositories/integration.repository.ts`
- [ ] `src/repositories/index.ts` - Exports

### Tarefas
- [ ] Implementar métodos padrão (create, findById, findMany, update, delete)
- [ ] Atualizar services para usar repositories
- [ ] Remover Prisma calls direto de services
- [ ] Manter Prisma calls só em repositories

### Testes
- [ ] Mesmos testes de FASE 2 devem continuar passando

### Commit
- [ ] `git commit -m "refactor: Implement repository pattern for data access"`

---

## 🎨 FASE 4: DESIGN SYSTEM (13-16 horas)

### 4.1: Tokens & Theme (2 hours)

#### Criar Files
- [ ] `src/shared/styles/tokens.ts`
- [ ] `src/shared/styles/theme.ts`
- [ ] `src/shared/styles/index.ts`

#### Tarefas
- [ ] Consolidar colors de `lib/design/colors.ts`
- [ ] Criar spacing scale (xs, sm, md, lg, xl, 2xl, 3xl)
- [ ] Criar typography scale
- [ ] Criar shadow scale
- [ ] Criar border radius scale
- [ ] Criar transition scale
- [ ] Criar theme provider

### 4.2: Base UI Components (8-10 hours)

#### Criar Components
- [ ] `src/shared/components/ui/Button.tsx` (primary, secondary, ghost, danger)
- [ ] `src/shared/components/ui/Input.tsx` (text, email, password)
- [ ] `src/shared/components/ui/Card.tsx` (container)
- [ ] `src/shared/components/ui/Modal.tsx` (dialog)
- [ ] `src/shared/components/ui/Select.tsx` (dropdown)
- [ ] `src/shared/components/ui/Checkbox.tsx`
- [ ] `src/shared/components/ui/Badge.tsx` (tag)
- [ ] `src/shared/components/ui/Alert.tsx` (notifications)
- [ ] `src/shared/components/ui/Table.tsx` (data table)
- [ ] `src/shared/components/ui/Pagination.tsx`
- [ ] `src/shared/components/ui/Skeleton.tsx` (loading)
- [ ] `src/shared/components/ui/index.ts` - Exports

#### Tarefas
- [ ] Cada componente com variants, sizes, states
- [ ] Props bem tipadas
- [ ] Responsivo
- [ ] Dark mode support
- [ ] Usar design tokens

### 4.3: Common Components (2-3 hours)

#### Criar Components
- [ ] `src/shared/components/common/Loading.tsx`
- [ ] `src/shared/components/common/Empty.tsx`
- [ ] `src/shared/components/common/Error.tsx`
- [ ] `src/shared/components/common/KPICard.tsx`
- [ ] `src/shared/components/common/Chart.tsx`
- [ ] `src/shared/components/common/index.ts`

### 4.4: Layout Components (3-4 hours)

#### Refactor/Criar
- [ ] `src/shared/components/layout/Header.tsx` (refactor)
- [ ] `src/shared/components/layout/Sidebar.tsx` (refactor)
- [ ] `src/shared/components/layout/MainLayout.tsx` (novo)
- [ ] `src/shared/components/layout/index.ts`

#### Tarefas
- [ ] Usar tokens em todos componentes
- [ ] Padronizar espaçamento
- [ ] Padronizar cores
- [ ] Padronizar tipografia
- [ ] Testar responsivo

### 4.5: Update Existing Pages

#### Pages a Atualizar
- [ ] `/dashboard/page.tsx` - Usar novos componentes
- [ ] `/login/page.tsx` - Usar novos componentes
- [ ] `/companies/page.tsx` - Usar novos componentes
- [ ] `/companies/[id]/page.tsx` - Usar novos componentes
- [ ] `/companies/[id]/crm/page.tsx` - Usar novos componentes
- [ ] Etc (todas as páginas)

### Commits FASE 4
- [ ] `git commit -m "feat: Create design system with tokens and theme"`
- [ ] `git commit -m "feat: Add UI base components library"`
- [ ] `git commit -m "feat: Add common and layout components"`
- [ ] `git commit -m "refactor: Apply design system to all pages"`

### Testes FASE 4
- [ ] Dashboard visual deve estar consistente
- [ ] Componentes devem responder ao tema (light/dark)
- [ ] Responsivo: mobile, tablet, desktop
- [ ] Tudo deve funcionar (CRUD operations)

---

## 🔒 FASE 5: CONSOLIDAÇÃO & SECURITY (5-8 horas)

### 5.1: Middleware Padrão (2-3 hours)

#### Tarefas
- [ ] Aplicar middleware em ALL `/api/v1/` endpoints
- [ ] Aplicar middleware em `/api/webhooks/` endpoints
- [ ] Aplicar middleware em `/api/cron/` endpoints (com secret check)
- [ ] Criar middleware de rate limiting (placeholder)
- [ ] Criar middleware de request logging

### 5.2: Validação Padrão (2 hours)

#### Criar Files
- [ ] `src/shared/utils/validators.ts` - Schemas centralizados

#### Tarefas
- [ ] Consolidar todos os Zod schemas
- [ ] Criar validators para: Company, Lead, Sale, Campaign, etc
- [ ] Usar em todos endpoints
- [ ] Validar request body + params

### 5.3: Error Handling (1-2 hours)

#### Criar Files
- [ ] `src/shared/utils/errors.ts` - Error classes
- [ ] `src/shared/utils/error-handler.ts` - Error handler middleware

#### Tarefas
- [ ] Criar AppError, NotFoundError, UnauthorizedError, BadRequestError
- [ ] Criar error handler middleware
- [ ] Usar em todos endpoints
- [ ] Retornar status codes corretos (400, 401, 403, 404, 500)

### 5.4: Audit Logging (1-2 hours)

#### Tarefas
- [ ] Implementar `AuditLog` em todas as operações (create, update, delete)
- [ ] Registrar: userId, action, resource, resourceId, changes
- [ ] Criar `AuditService` em `core/audit/`

### Commits FASE 5
- [ ] `git commit -m "security: Apply middleware to all API endpoints"`
- [ ] `git commit -m "refactor: Consolidate validators and error handling"`
- [ ] `git commit -m "feat: Implement audit logging"`

### Testes FASE 5
- [ ] 401 ao acessar sem autenticação
- [ ] 403 ao acessar empresa diferente
- [ ] Validação de dados deve rejeitar inválidos
- [ ] Audit logs devem ser criados

---

## 📚 FASE 6: DOCUMENTAÇÃO & TESTING (4-5 horas)

### 6.1: Architecture Docs (2 hours)

#### Criar Files
- [ ] `docs/ARCHITECTURE.md` - Overview
- [ ] `docs/MODULES.md` - Documentação de módulos
- [ ] `docs/API.md` - Endpoints documentados
- [ ] `docs/CONTRIBUTING.md` - Guia para contribuidores
- [ ] `docs/DATABASE.md` - Schema documentation

#### Tarefas
- [ ] Descrever estrutura de pastas
- [ ] Explicar padrões (Service → Repository → DB)
- [ ] Documentar cada módulo
- [ ] Documentar cada endpoint (request/response)

### 6.2: Type Safe Routes (1 hour)

#### Criar Files
- [ ] `src/shared/constants/routes.ts`

#### Tarefas
- [ ] Criar objeto com todas as rotas
- [ ] Usar em componentes (links, redirects)

### 6.3: Testing Infrastructure (1-2 hours)

#### Tarefas
- [ ] Setup vitest ou jest
- [ ] Criar test utilities
- [ ] Exemplo de service test
- [ ] Exemplo de API test
- [ ] README para testes

### Commits FASE 6
- [ ] `git commit -m "docs: Add architecture and module documentation"`
- [ ] `git commit -m "feat: Add type-safe routes constants"`
- [ ] `git commit -m "test: Setup testing infrastructure"`

### Testes FASE 6
- [ ] `npm run build` - Deve passar sem erros
- [ ] Docs devem estar claros e completos
- [ ] Exemplo de teste deve rodar

---

## 🔄 VERIFICAÇÃO FINAL

### Build & Types
- [ ] `npm run build` - Sem erros
- [ ] Sem warnings de TypeScript
- [ ] Remover `ignoreBuildErrors: true`

### Functional Tests
- [ ] Login → Autenticação
- [ ] Dashboard → Carrega dados
- [ ] Companies CRUD → Funciona
- [ ] Leads CRUD → Funciona
- [ ] Sales CRUD → Funciona
- [ ] Integrations → Funciona
- [ ] WhatsApp → Funciona
- [ ] Ads sync → Funciona

### Performance
- [ ] Build time < 60s
- [ ] Dev server inicia rápido
- [ ] Dashboard carrega < 2s
- [ ] APIs respondem < 500ms

### Code Quality
- [ ] Sem console.logs em produção
- [ ] Sem commented code
- [ ] Consistent formatting
- [ ] Type-safe (sem `any`)

### Security
- [ ] Auth middleware aplicado
- [ ] Validação em todos endpoints
- [ ] Error handling sem exposição
- [ ] CORS configurado
- [ ] Rate limiting placeholder

---

## 📝 FINALIZAÇÃO

### Merge Checklist
- [ ] Todos os commits estão bem escritos
- [ ] Nenhuma rota quebrada
- [ ] Documentação atualizada
- [ ] Testes básicos passam

### Merge para Master
```bash
git push origin master-01-enterprise-refactor
# Criar PR no GitHub
# Review e merge
```

### Deploy
- [ ] Testar em staging
- [ ] Verificar todas as features funcionam
- [ ] Deploy para produção
- [ ] Monitorar por erros

---

## 🎯 MÉTRICAS PÓS-IMPLEMENTATION

Esperado após MASTER 01:

| Métrica | Antes | Depois | Status |
|---------|-------|--------|--------|
| Arquivos TS/TSX | 112 | 150+ | ✅ |
| Lines of Code | 14.286 | 18.000+ | ✅ |
| Componentes Reutilizáveis | 5 | 50+ | ✅ |
| Test Coverage | 0% | 10%+ | ✅ |
| Build Time | ? | < 60s | ✅ |
| Breaking Changes | N/A | 0 | ✅ |
| API Endpoints Funcional | 100% | 100% | ✅ |

---

## 🚀 PRÓXIMO: MASTER 02

Após merge do MASTER 01:

- [ ] Feature flags
- [ ] Module marketplace
- [ ] Billing & subscriptions
- [ ] Advanced permissions

---

**Total Estimated Time: 38-51 hours full-time development**  
**Recommendation: 2-3 days focusing**

Good luck! 💪
