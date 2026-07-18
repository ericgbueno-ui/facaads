# 🏗️ MASTER 01: PLANO DE IMPLEMENTAÇÃO
**Data:** 2026-07-18  
**Objetivo:** Transformar em Plataforma Enterprise Modular  
**Tempo Estimado:** 2-3 dias de desenvolvimento focado  
**Risco:** BAIXO (zero perda de funcionalidade)

---

## 📋 VISÃO GERAL DO PLANO

### Princípios Fundamentais
1. ✅ **PRESERVAR 100%** - Nenhuma funcionalidade será removida
2. ✅ **ZERO BREAKING CHANGES** - Todas as rotas continuarão funcionando
3. ✅ **MODULAR FIRST** - Preparar para dezenas de módulos futuros
4. ✅ **CLEAN ARCHITECTURE** - Service → Repository → Database
5. ✅ **ENTERPRISE STANDARD** - SOLID, DDD principles

---

## 🎯 FASES DE IMPLEMENTAÇÃO

### FASE 1: ESTRUTURA MODULAR (Dia 1)
**Objetivo:** Criar layout de pastas com zero código alterado

```
src/
├── core/                              # NOVO: Kernel do sistema
│   ├── auth/
│   │   ├── middleware.ts              # Mover: lib/auth-middleware.ts
│   │   ├── service.ts                 # Novo: Lógica de auth
│   │   └── types.ts                   # Novo: Tipos de auth
│   ├── tenant/
│   │   ├── service.ts                 # Novo: Multi-tenant logic
│   │   └── middleware.ts              # Novo: Tenant validation
│   ├── permissions/
│   │   ├── service.ts                 # Novo: Permission checks
│   │   └── types.ts                   # Novo: Permissões
│   ├── audit/
│   │   ├── service.ts                 # Novo: Audit logging
│   │   └── types.ts                   # Novo: Audit types
│   ├── config/
│   │   ├── app.ts                     # Novo: App configuration
│   │   └── constants.ts               # Novo: Constantes globais
│   └── types/
│       └── index.ts                   # Novo: Tipos globais
│
├── modules/                           # NOVO: Módulos independentes
│   ├── ads/                           # Mover: lib/ads → módulo
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── types.ts
│   │   └── index.ts
│   ├── crm/                           # Novo: CRM module
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── types.ts
│   │   └── index.ts
│   ├── whatsapp/                      # Novo: WhatsApp module
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── types.ts
│   │   └── index.ts
│   ├── financeiro/                    # Novo: Finance module
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── types.ts
│   │   └── index.ts
│   ├── integrations/                  # Novo: Integrations module
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── types.ts
│   │   └── index.ts
│   └── reports/                       # Novo: Reports module
│       ├── services/
│       ├── repositories/
│       ├── types.ts
│       └── index.ts
│
├── shared/                            # NOVO: Componentes compartilhados
│   ├── components/
│   │   ├── ui/                        # Componentes base (Button, Input, etc)
│   │   ├── layout/                    # Layout components
│   │   ├── common/                    # Componentes comuns
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useCompany.ts
│   │   ├── useAuth.ts
│   │   ├── useFetch.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── formatters.ts              # Funções de formatação
│   │   ├── validators.ts              # Validações
│   │   ├── helpers.ts                 # Helpers gerais
│   │   └── index.ts
│   ├── constants/
│   │   ├── routes.ts                  # Rotas da app
│   │   ├── messages.ts                # Mensagens
│   │   └── index.ts
│   ├── types/
│   │   ├── common.ts                  # Tipos comuns
│   │   ├── api.ts                     # Tipos de API
│   │   └── index.ts
│   └── styles/
│       ├── tokens.ts                  # Design tokens
│       ├── theme.ts                   # Tema
│       └── index.ts
│
├── services/                          # NOVO: Serviços transversais
│   ├── event-bus/
│   │   ├── event-bus.ts               # Event system
│   │   └── types.ts
│   ├── cache/
│   │   ├── service.ts                 # Cache abstraction
│   │   └── index.ts
│   ├── notifications/
│   │   ├── service.ts                 # Notificações
│   │   └── index.ts
│   ├── logging/
│   │   ├── service.ts                 # Logging system
│   │   └── index.ts
│   └── index.ts
│
├── repositories/                      # NOVO: Data access layer
│   ├── company.repository.ts
│   ├── lead.repository.ts
│   ├── sale.repository.ts
│   ├── campaign.repository.ts
│   ├── user.repository.ts
│   └── index.ts
│
├── types/                             # REFATORADO: Tipos globais
│   ├── index.ts                       # Re-exportar tudo
│   ├── common.ts
│   ├── api.ts
│   └── auth.ts
│
├── lib/                               # LEGADO: Mantém integrações
│   ├── prisma.ts                      # Manter
│   ├── auth.ts                        # Manter (exportar de core/)
│   └── (resto para serem migrados)
│
├── app/                               # Não muda estrutura
│   ├── api/                           # APIs refatoradas
│   ├── dashboard/                     # Dashboard refatorado
│   └── (resto mantém estrutura)
│
└── components/                        # Legado, será refatorado para shared/

```

**Tarefas FASE 1:**
- [ ] Criar pastas base: core/, modules/, shared/, services/, repositories/
- [ ] Criar arquivos index.ts em cada módulo
- [ ] Criar tsconfig paths para imports limpos
- [ ] Documentar estrutura em README

**Tempo:** 2-3 horas  
**Commits:** 1 "chore: Create modular structure"

---

### FASE 2: SERVICE LAYER (Dia 1-2)
**Objetivo:** Extrair lógica de negócio de APIs e componentes

#### 2.1: Auth Service
```typescript
// src/core/auth/service.ts
export class AuthService {
  async validateCredentials(email, password) { }
  async validateCompanyAccess(userId, companyId) { }
  async createSession(user) { }
  async validateToken(token) { }
}
```

**Tarefas:**
- [ ] Extrair lógica de `lib/auth.ts` → `core/auth/service.ts`
- [ ] Extrair validações de `lib/auth-middleware.ts` → `core/tenant/middleware.ts`
- [ ] Atualizar imports em APIs

**Tempo:** 1-2 horas  
**Commits:** 1 "refactor: Extract auth service layer"

#### 2.2: Company Service
```typescript
// src/modules/crm/services/company.service.ts
export class CompanyService {
  async getById(id, context) { }
  async listByUser(userId) { }
  async create(data, userId) { }
  async update(id, data, context) { }
}
```

**Tarefas:**
- [ ] Criar `CompanyService`
- [ ] Extrair lógica de `/api/v1/companies`
- [ ] Mover `getCompanyUser`, `validateCompanyAccess` para service
- [ ] Atualizar endpoints para usar service

**Tempo:** 2-3 horas  
**Commits:** 2 ("refactor: Extract company service", "refactor: Use company service in APIs")

#### 2.3: Lead Service
```typescript
// src/modules/crm/services/lead.service.ts
export class LeadService {
  async create(companyId, data) { }
  async update(companyId, leadId, data) { }
  async list(companyId, filters) { }
  async getById(companyId, leadId) { }
}
```

**Tarefas:**
- [ ] Criar `LeadService`
- [ ] Extrair queries de `/api/v1/companies/[id]/leads`
- [ ] Atualizar endpoints
- [ ] Adicionar validações com Zod

**Tempo:** 2 horas  
**Commits:** 1 "refactor: Extract lead service"

#### 2.4: Sale Service
```typescript
// src/modules/financeiro/services/sale.service.ts
export class SaleService {
  async create(companyId, data) { }
  async update(companyId, saleId, data) { }
  async list(companyId, filters) { }
  async getReport(companyId, period) { }
  async export(companyId, format) { }
}
```

**Tarefas:**
- [ ] Criar `SaleService`
- [ ] Extrair queries de `/api/v1/companies/[id]/sales`
- [ ] Implementar export logic
- [ ] Atualizar endpoints

**Tempo:** 2 horas  
**Commits:** 1 "refactor: Extract sale service"

#### 2.5: Ad Sync Service
```typescript
// src/modules/ads/services/sync.service.ts
export class AdSyncService {
  async syncMeta(adAccountId, context) { }
  async syncGoogle(adAccountId, context) { }
  async syncTikTok(adAccountId, context) { }
  async syncShopee(adAccountId, context) { }
}
```

**Tarefas:**
- [ ] Consolidar `lib/ads/sync.ts` + channel-specific
- [ ] Criar factory pattern para cada channel
- [ ] Extrair para service
- [ ] Usar em `/api/cron/sync-*`

**Tempo:** 3-4 horas  
**Commits:** 2 ("refactor: Extract ad sync service", "refactor: Consolidate ad channels")

**FASE 2 Total:** 10-14 horas  
**Commits:** 6-7

---

### FASE 3: REPOSITORY PATTERN (Dia 2)
**Objetivo:** Data access abstraction

```typescript
// src/repositories/company.repository.ts
export class CompanyRepository {
  async findById(id: string) { }
  async findManyByUser(userId: string) { }
  async create(data: CreateCompanyInput) { }
  async update(id: string, data: UpdateCompanyInput) { }
  async delete(id: string) { }
}
```

**Tarefas:**
- [ ] Criar repository base class
- [ ] Implementar: CompanyRepository, LeadRepository, SaleRepository, CampaignRepository, UserRepository, IntegrationRepository
- [ ] Atualizar services para usar repositories
- [ ] Remover Prisma calls direto de services

**Tempo:** 4-5 horas  
**Commits:** 1 "refactor: Implement repository pattern"

---

### FASE 4: DESIGN SYSTEM (Dia 2-3)
**Objetivo:** Componentes reutilizáveis

#### 4.1: Tokens & Theme
```typescript
// src/shared/styles/tokens.ts
export const tokens = {
  colors: {
    primary: { 50, 100, ..., 900 },
    neutral: { 50, 100, ..., 900 },
  },
  spacing: { xs, sm, md, lg, xl, '2xl', ... },
  typography: { xs, sm, base, lg, xl, '2xl' },
  shadows: { sm, md, lg, xl },
};
```

**Tarefas:**
- [ ] Consolidar colors de `lib/design/colors.ts`
- [ ] Criar spacing scale
- [ ] Criar typography scale
- [ ] Criar shadow scale
- [ ] Criar theme provider

**Tempo:** 2 horas  
**Commits:** 1 "feat: Create design system tokens"

#### 4.2: Base Components
```typescript
// src/shared/components/ui/
├── Button.tsx              # Botão com variants
├── Input.tsx               # Input com states
├── Card.tsx                # Card container
├── Modal.tsx               # Modal dialog
├── Select.tsx              # Select dropdown
├── Checkbox.tsx            # Checkbox
├── Badge.tsx               # Badge/tag
├── Table.tsx               # Data table
├── Pagination.tsx          # Pagination
├── Skeleton.tsx            # Loading skeleton
└── ...
```

**Tarefas:**
- [ ] Criar button component (primary, secondary, ghost, danger)
- [ ] Criar input component (text, email, password, number)
- [ ] Criar card component
- [ ] Criar modal component
- [ ] Criar select component
- [ ] Criar badge component
- [ ] Criar table component
- [ ] Criar pagination component
- [ ] Criar skeleton component
- [ ] Adicionar a componentes existentes (refactor DashboardOverview, etc)

**Tempo:** 8-10 horas  
**Commits:** 2 ("feat: Add UI base components", "refactor: Use design system in pages")

#### 4.3: Layout Components
```typescript
// src/shared/components/layout/
├── Header.tsx              # Refactor Header
├── Sidebar.tsx             # Refactor Sidebar
├── MainLayout.tsx          # Main layout wrapper
└── ...
```

**Tarefas:**
- [ ] Refactor Header component
- [ ] Refactor Sidebar component
- [ ] Criar MainLayout wrapper
- [ ] Atualizar páginas para usar

**Tempo:** 3-4 horas  
**Commits:** 1 "refactor: Standardize layout components"

**FASE 4 Total:** 13-16 horas  
**Commits:** 4

---

### FASE 5: CONSOLIDAÇÃO & SECURITY (Dia 3)
**Objetivo:** Segurança, validação, middleware

#### 5.1: Middleware Padrão
```typescript
// src/app/api/middleware.ts
export const apiMiddleware = [
  withAuth,
  withCompanyAccess,
  withAudit,
  withErrorHandler,
];
```

**Tarefas:**
- [ ] Aplicar middleware em ALL `/api/v1/` endpoints
- [ ] Aplicar middleware em `/api/webhooks/` endpoints
- [ ] Aplicar middleware em `/api/cron/` endpoints (com secret check)
- [ ] Criar middleware de rate limiting (placeholder)

**Tempo:** 2-3 horas  
**Commits:** 1 "security: Apply standardized middleware to all APIs"

#### 5.2: Validação Padrão
```typescript
// src/shared/utils/validators.ts
export const CompanyValidator = z.object({
  name: z.string().min(1).max(255),
  segment: z.string().optional(),
  ...
});
```

**Tarefas:**
- [ ] Consolidar validadores em `shared/utils/validators.ts`
- [ ] Exportar de cada módulo: `ads/validators.ts`, `crm/validators.ts`, etc
- [ ] Usar em todos endpoints
- [ ] Adicionar mais validadores onde faltam

**Tempo:** 2-3 horas  
**Commits:** 1 "refactor: Consolidate validators"

#### 5.3: Error Handling
```typescript
// src/shared/utils/errors.ts
export class AppError extends Error { }
export class NotFoundError extends AppError { }
export class UnauthorizedError extends AppError { }
export class BadRequestError extends AppError { }
```

**Tarefas:**
- [ ] Criar error types
- [ ] Criar error handler middleware
- [ ] Atualizar all endpoints para usar

**Tempo:** 1-2 horas  
**Commits:** 1 "refactor: Standardize error handling"

**FASE 5 Total:** 5-8 horas  
**Commits:** 3

---

### FASE 6: DOCUMENTAÇÃO & TESTING (Dia 3)
**Objetivo:** Documentar nova arquitetura

#### 6.1: Architecture Docs
- [ ] Criar `docs/ARCHITECTURE.md` - Overview da estrutura
- [ ] Criar `docs/MODULES.md` - Documentação de cada módulo
- [ ] Criar `docs/API.md` - Documentação de endpoints
- [ ] Criar `docs/CONTRIBUTING.md` - Guia para contribuidores

#### 6.2: Type Safe Paths
```typescript
// src/shared/constants/routes.ts
export const routes = {
  dashboard: '/dashboard',
  companies: '/companies',
  companies: (id) => `/companies/${id}`,
  crm: (id) => `/companies/${id}/crm`,
  ...
};
```

**Tarefas:**
- [ ] Criar `shared/constants/routes.ts`
- [ ] Usar em componentes e links

#### 6.3: Testing Infrastructure
- [ ] Setup vitest/jest
- [ ] Criar test utilities
- [ ] Adicionar exemplo de service test

**Tempo:** 4-5 horas  
**Commits:** 2 ("docs: Add architecture documentation", "test: Setup testing infrastructure")

---

## 📊 TIMELINE TOTAL

| Fase | Tarefas | Tempo | Commits |
|------|---------|-------|---------|
| **1: Estrutura** | Criar pastas, refactor imports | 2-3h | 1 |
| **2: Service Layer** | Auth, Company, Lead, Sale, Ads | 10-14h | 6-7 |
| **3: Repository** | Data access abstraction | 4-5h | 1 |
| **4: Design System** | Tokens, componentes, layout | 13-16h | 4 |
| **5: Security** | Middleware, validação, errors | 5-8h | 3 |
| **6: Docs & Testing** | Documentação e testes | 4-5h | 2 |
| **TOTAL** | | **38-51h** | **17-18** |

**Tempo Real (com breaks/testing):** 2-3 dias full-time

---

## 🔒 GARANTIAS DE QUALIDADE

### ✅ Testes que Rodarão
1. **Manual Route Testing** - Testar cada endpoint
   - GET /api/v1/companies (antes e depois)
   - POST /api/v1/companies/{id}/leads (antes e depois)
   - GET /dashboard (render antes e depois)
   - Etc.

2. **Build Test**
   - `npm run build` não deve falhar
   - Sem erros de TypeScript

3. **Type Safety**
   - Todos os erros TS devem ser corrigidos
   - Remover `ignoreBuildErrors`

4. **Integration Test** (amostra)
   - Testar fluxo completo: Auth → Company → Lead → Dashboard

### ✅ Zero Breaking Changes
- Todas as rotas mantêm endpoints
- Response shapes não mudam
- Query parameters não mudam
- Banco de dados não muda (apenas reorganização de código)

---

## 📝 COMMIT MESSAGES

```bash
# FASE 1
git commit -m "chore: Create modular architecture structure"

# FASE 2
git commit -m "refactor: Extract auth service layer"
git commit -m "refactor: Extract company service layer"
git commit -m "refactor: Extract lead service layer"
git commit -m "refactor: Extract sale service layer"
git commit -m "refactor: Extract and consolidate ad sync service"
git commit -m "refactor: Update APIs to use service layer"

# FASE 3
git commit -m "refactor: Implement repository pattern for data access"

# FASE 4
git commit -m "feat: Create design system with tokens and theme"
git commit -m "feat: Add UI base components library"
git commit -m "feat: Standardize layout components"
git commit -m "refactor: Apply design system to existing components"

# FASE 5
git commit -m "security: Apply middleware to all API endpoints"
git commit -m "refactor: Consolidate validators and error handling"

# FASE 6
git commit -m "docs: Add architecture and module documentation"
git commit -m "test: Setup testing infrastructure"
```

---

## 🎯 PRÓXIMAS FASES (MASTER 02+)

### MASTER 02: Modularização Completa
- [ ] Feature flags para ativação/desativação de módulos
- [ ] Cada módulo com migrations próprias
- [ ] Billing & subscriptions
- [ ] Module marketplace

### MASTER 03: IA & Automações
- [ ] Event Bus para comunicação entre módulos
- [ ] Automações via workflows
- [ ] IA integrada em leads/respostas
- [ ] Machine Learning models

### MASTER 04: Scale & Performance
- [ ] Caching strategy (Redis)
- [ ] Rate limiting
- [ ] GraphQL layer (opcional)
- [ ] CDN para assets

---

## 🚀 PRÓXIMO PASSO

**Iniciar FASE 1 agora**

```bash
cd "C:\projetos ia\herge"
git checkout -b master-01-enterprise-refactor
# Começar criação de pastas...
```

---

## 📞 DÚVIDAS & ESCALAÇÃO

Qualquer dúvida sobre a arquitetura durante implementação:
1. Consultar `MASTER_01_AUDIT_REPORT.md` para contexto
2. Revisar padrões em modules/ já criados
3. Manter princípio: **Service → Repository → Database**
4. Manter componentes compartilhados em shared/

**Filosofia:** Quando em dúvida, prefira **modularidade** sobre facilidade imediata.
