# 🚀 MASTER 02: IMPLEMENTATION PLAN
**Status:** Design Complete  
**Objetivo:** Implementar Core Platform SaaS Multi-Tenant  
**Tempo Estimado:** 60-80 horas full-time development  
**Recomendação:** 4-5 dias focados  

---

## 📋 RESUMO EXECUTIVO

O MASTER 02 implementará a **fundação empresarial** do HERGÉ:
- ✅ Autenticação robusta
- ✅ Multi-tenant bulletproof
- ✅ RBAC granular
- ✅ Auditoria completa
- ✅ Segurança enterprise
- ✅ Preparado para produção

**Zero perda de funcionalidade** do MASTER 01.

---

## 🎯 FASES DE IMPLEMENTAÇÃO

### FASE 1: BANCO DE DADOS (4-5 horas)

#### 1.1: Criar Migrations
**Arquivos a criar:**
- `prisma/migrations/[timestamp]_add_core_models/migration.sql`
- `prisma/migrations/[timestamp]_add_company_expansion/migration.sql`
- `prisma/migrations/[timestamp]_add_auth_expansion/migration.sql`
- `prisma/migrations/[timestamp]_add_security/migration.sql`
- `prisma/migrations/[timestamp]_add_notifications/migration.sql`
- `prisma/migrations/[timestamp]_add_feature_flags/migration.sql`
- `prisma/migrations/[timestamp]_add_billing/migration.sql`
- `prisma/migrations/[timestamp]_add_audit_logs/migration.sql`
- `prisma/migrations/[timestamp]_add_search/migration.sql`
- `prisma/migrations/[timestamp]_add_file_storage/migration.sql`

#### 1.2: Atualizar Schema.prisma
**Tarefas:**
- [ ] Expandir modelo User com campos de autenticação
- [ ] Expandir modelo Company com customização
- [ ] Criar Role model
- [ ] Criar Permission model  
- [ ] Criar RolePermission model
- [ ] Criar Session model expandido
- [ ] Criar Device model
- [ ] Criar AuditLog model expandido
- [ ] Criar FeatureFlag model
- [ ] Criar Plan model
- [ ] Criar BillingPlan model
- [ ] Criar Notification models (2)
- [ ] Criar File model
- [ ] Criar CompanySettings model
- [ ] Criar SearchIndex model
- [ ] Adicionar índices estratégicos
- [ ] Gerar Prisma Client

#### 1.3: Verificação de Banco
**Tarefas:**
- [ ] `npx prisma migrate dev` sem erros
- [ ] `npx prisma studio` abrindo
- [ ] Todas as tabelas criadas
- [ ] Todos os índices criados
- [ ] Relacionamentos validados

**Tempo:** 4-5 horas  
**Commits:** 1 ("feat: Add MASTER 02 database schema with core models")

---

### FASE 2: CORE AUTH SERVICE (8-10 horas)

#### 2.1: Auth Service Completo
**Arquivo:**
- `src/core/auth/service.ts`

**Métodos:**
```typescript
class AuthService {
  // Autenticação
  async login(email, password)
  async logout(sessionId)
  async register(userData)
  async validateCredentials(email, password)
  
  // Sessão
  async createSession(user, device)
  async refreshToken(refreshToken)
  async validateToken(token)
  async invalidateSession(sessionId)
  
  // Password
  async hashPassword(password)
  async comparePassword(password, hash)
  async sendPasswordReset(email)
  async resetPassword(token, newPassword)
  async changePassword(userId, currentPassword, newPassword)
  
  // Email Verification
  async sendVerificationEmail(email)
  async verifyEmail(token)
  
  // Account Lockout
  async recordFailedLogin(email)
  async unlockAccount(email)
  async isAccountLocked(email)
}
```

**Tarefas:**
- [ ] Implementar cada método
- [ ] Usar bcryptjs para hash
- [ ] Usar jwt para tokens
- [ ] Implementar lockout após 5 tentativas
- [ ] Implementar expiration de tokens
- [ ] Usar Zod para validação

#### 2.2: Session Service
**Arquivo:**
- `src/core/auth/session.service.ts`

**Métodos:**
```typescript
class SessionService {
  async createSession(userId, companyId, device)
  async getSession(sessionToken)
  async updateLastActivity(sessionToken)
  async terminateSession(sessionToken)
  async terminateAllSessions(userId)
  async terminateAllOtherSessions(userId, currentSessionId)
  async getActiveSessions(userId)
  async cleanupExpiredSessions()
}
```

**Tarefas:**
- [ ] Armazenar em banco + cache
- [ ] TTL de 24 horas
- [ ] Atualizar lastActivityAt
- [ ] Logout em todos devices (opcional)
- [ ] Cleanup de sessões expiradas

#### 2.3: Middleware de Auth
**Arquivo:**
- `src/core/auth/middleware.ts`

**Middlewares:**
```typescript
export const requireAuth = async (req, handler) => {}
export const optionalAuth = async (req, handler) => {}
export const validateToken = (token) => {}
export const extractContext = (req) => {}
```

**Tarefas:**
- [ ] Validar JWT
- [ ] Extrair userId e companyId
- [ ] Rejeitar se inválido
- [ ] Injetar context em request
- [ ] Atualizar lastActivityAt

#### 2.4: Endpoints de Auth
**Arquivos:**
- `src/app/api/v1/auth/register/route.ts`
- `src/app/api/v1/auth/login/route.ts`
- `src/app/api/v1/auth/logout/route.ts`
- `src/app/api/v1/auth/refresh/route.ts`
- `src/app/api/v1/auth/me/route.ts`
- `src/app/api/v1/auth/change-password/route.ts`
- `src/app/api/v1/auth/forgot-password/route.ts`
- `src/app/api/v1/auth/reset-password/route.ts`
- `src/app/api/v1/auth/verify-email/route.ts`

**Tarefas:**
- [ ] Implementar cada endpoint
- [ ] Validar com Zod
- [ ] Retornar JWT + refresh token
- [ ] Usar cookies HttpOnly, Secure, SameSite
- [ ] Implementar rate limiting
- [ ] Registrar em AuditLog

**Tempo:** 8-10 horas  
**Commits:** 2 ("feat: Implement auth service", "feat: Add auth endpoints")

---

### FASE 3: MULTI-TENANT & TENANT SERVICE (6-8 horas)

#### 3.1: Tenant Service
**Arquivo:**
- `src/core/tenant/service.ts`

**Métodos:**
```typescript
class TenantService {
  async getTenantContext(userId, companyId)
  async validateUserCompanyAccess(userId, companyId)
  async getUserCompanies(userId)
  async switchCompany(userId, newCompanyId)
  async getCurrentCompany(userId)
}
```

**Tarefas:**
- [ ] Validar que usuário tem acesso à empresa
- [ ] Carregar role e permissões
- [ ] Carregar settings da empresa
- [ ] Carregar plano
- [ ] Cache em Redis

#### 3.2: Tenant Middleware
**Arquivo:**
- `src/core/tenant/middleware.ts`

**Tarefas:**
- [ ] Validar companyId em request
- [ ] Validar acesso do usuário
- [ ] Injetar tenant context
- [ ] Garantir isolamento total
- [ ] Rejeitar requisições inválidas

#### 3.3: Tenant-safe Repository
**Arquivo:**
- `src/repositories/base.repository.ts` (atualizar)

**Tarefas:**
- [ ] Adicionar method `withTenant(companyId)`
- [ ] Todas as queries incluem `where: { companyId, ... }`
- [ ] Impossível contornar tenant check
- [ ] TypeScript força tenant parameter

#### 3.4: Endpoints de Company
**Arquivos:**
- `src/app/api/v1/companies/route.ts` (atualizar)
- `src/app/api/v1/companies/[id]/route.ts` (atualizar)
- `src/app/api/v1/companies/[id]/settings/route.ts`
- `src/app/api/v1/companies/[id]/switch/route.ts`

**Tarefas:**
- [ ] Listar empresas do usuário
- [ ] Criar empresa
- [ ] Editar empresa
- [ ] Deletar empresa
- [ ] Upload logo
- [ ] Trocar empresa ativa
- [ ] Carregar/editar settings

**Tempo:** 6-8 horas  
**Commits:** 2 ("feat: Implement tenant service and isolation", "feat: Add company endpoints")

---

### FASE 4: RBAC & PERMISSIONS (10-12 horas)

#### 4.1: Permission Service
**Arquivo:**
- `src/core/permissions/service.ts`

**Métodos:**
```typescript
class PermissionService {
  // Roles
  async createRole(companyId, data)
  async getRoles(companyId)
  async getRoleById(companyId, roleId)
  async updateRole(companyId, roleId, data)
  async deleteRole(companyId, roleId)
  
  // Permissions
  async getAllPermissions()
  async addPermissionToRole(roleId, permissionId)
  async removePermissionFromRole(roleId, permissionId)
  
  // User Roles
  async assignRoleToUser(companyId, userId, roleId)
  async removeRoleFromUser(companyId, userId, roleId)
  async getUserRoles(companyId, userId)
  
  // Permission Checking
  async hasPermission(userId, companyId, resource, action)
  async checkPermission(context, resource, action)
}
```

**Tarefas:**
- [ ] Criar tabela de roles
- [ ] Criar tabela de permissões
- [ ] Definir 10+ roles predefinidos
- [ ] Definir 50+ permissões granulares
- [ ] Implementar inheritance
- [ ] Cache em Redis (TTL: 1h)

#### 4.2: Role Definitions
**Arquivo:**
- `src/core/permissions/roles.ts`

**Roles:**
```typescript
const ROLES = {
  ADMIN_MASTER: {
    name: 'Administrador Master',
    description: 'Acesso total ao sistema',
    permissions: ['*'],
  },
  ADMIN_COMPANY: {
    name: 'Administrador Empresa',
    description: 'Acesso total à empresa',
    permissions: [
      'users:*',
      'roles:*',
      'settings:edit',
      'audit:view',
    ],
  },
  MANAGER: {
    name: 'Gestor',
    description: 'Gerencia operações',
    permissions: [
      'users:view',
      'reports:view',
      'settings:view',
    ],
  },
  // ... mais 7 roles
}
```

#### 4.3: Permission Middleware
**Arquivo:**
- `src/core/permissions/middleware.ts`

**Middlewares:**
```typescript
export const requirePermission = (resource, action) => {}
export const checkPermissions = (permissions) => {}
export const loadPermissions = async (req) => {}
```

**Tarefas:**
- [ ] Validar permissão antes de executar
- [ ] Carregar de cache quando possível
- [ ] Rejeitar com 403 se não autorizado
- [ ] Registrar em AuditLog
- [ ] Suportar wildcards (users:*)

#### 4.4: Endpoints de Roles
**Arquivos:**
- `src/app/api/v1/roles/route.ts`
- `src/app/api/v1/roles/[id]/route.ts`
- `src/app/api/v1/roles/[id]/permissions/route.ts`
- `src/app/api/v1/users/[id]/roles/route.ts`

**Tarefas:**
- [ ] Listar roles
- [ ] Criar role
- [ ] Editar role
- [ ] Deletar role
- [ ] Gerenciar permissões de role
- [ ] Atribuir role a usuário

**Tempo:** 10-12 horas  
**Commits:** 2 ("feat: Implement RBAC system", "feat: Add role and permission endpoints")

---

### FASE 5: USER MANAGEMENT (6-8 horas)

#### 5.1: User Service
**Arquivo:**
- `src/core/users/service.ts`

**Métodos:**
```typescript
class UserService {
  async createUser(companyId, data)
  async getUserById(userId, companyId)
  async listUsers(companyId, filters)
  async updateUser(userId, companyId, data)
  async deleteUser(userId, companyId)
  async uploadAvatar(userId, companyId, file)
  async sendInvite(companyId, email)
  async acceptInvite(token)
  async resendInvite(companyId, userId)
}
```

#### 5.2: Avatar Upload
**Arquivo:**
- `src/core/users/avatar-service.ts`

**Tarefas:**
- [ ] Salvar em storage (S3 ou local)
- [ ] Redimensionar imagem
- [ ] Gerar thumbnails
- [ ] Limpar arquivo anterior
- [ ] Retornar URL pública

#### 5.3: Endpoints de Users
**Arquivos:**
- `src/app/api/v1/users/route.ts`
- `src/app/api/v1/users/[id]/route.ts`
- `src/app/api/v1/users/[id]/avatar/route.ts`
- `src/app/api/v1/users/[id]/invite/route.ts`
- `src/app/api/v1/users/[id]/resend-invite/route.ts`

**Tarefas:**
- [ ] Listar usuários da empresa
- [ ] Criar usuário
- [ ] Editar usuário
- [ ] Deletar usuário
- [ ] Upload avatar
- [ ] Enviar convite
- [ ] Aceitar convite

**Tempo:** 6-8 horas  
**Commits:** 2 ("feat: Implement user service", "feat: Add user management endpoints")

---

### FASE 6: SECURITY (8-10 horas)

#### 6.1: Audit Service
**Arquivo:**
- `src/core/audit/service.ts`

**Métodos:**
```typescript
class AuditService {
  async log(companyId, userId, action, resource, data)
  async logLogin(userId, companyId, device, ip)
  async logLogout(userId, companyId)
  async logPermissionChange(companyId, userId, changes)
  async getLogs(companyId, filters)
  async getChangeHistory(companyId, resource, resourceId)
}
```

#### 6.2: Audit Middleware
**Arquivo:**
- `src/core/audit/middleware.ts`

**Tarefas:**
- [ ] Interceptar todas as mudanças (create, update, delete)
- [ ] Registrar before/after values
- [ ] Guardar IP e device
- [ ] Timestamp preciso
- [ ] Cleanup de logs antigos (opcionalmente)

#### 6.3: Security Headers
**Arquivo:**
- `src/core/security/headers.ts`

**Headers:**
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: ...
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

#### 6.4: CSRF Protection
**Arquivo:**
- `src/core/security/csrf.ts`

**Tarefas:**
- [ ] Gerar CSRF token
- [ ] Validar em POST/PUT/DELETE
- [ ] Usar double-submit pattern
- [ ] Configurar cookie SameSite

#### 6.5: Rate Limiting
**Arquivo:**
- `src/core/security/rate-limit.ts`

**Estratégias:**
```
Login:       5 tentativas/15min por IP
API:         100 requests/min por usuário
Register:    3 contas/hora por IP
Password:    3 tentativas/hora por email
```

#### 6.6: Device Tracking
**Arquivo:**
- `src/core/security/device-tracker.ts`

**Tarefas:**
- [ ] Gerar device ID único
- [ ] Rastrear OS, browser, modelo
- [ ] Salvar em banco
- [ ] Permitir gerenciamento de dispositivos
- [ ] Opcionalmente rejeitar novos devices

#### 6.7: Endpoints de Security
**Arquivos:**
- `src/app/api/v1/security/sessions/route.ts`
- `src/app/api/v1/security/devices/route.ts`
- `src/app/api/v1/audit/route.ts`

**Tarefas:**
- [ ] Listar/terminar sessões
- [ ] Listar/remover dispositivos
- [ ] Listar logs de auditoria

**Tempo:** 8-10 horas  
**Commits:** 2 ("feat: Implement audit and security services", "feat: Add security endpoints")

---

### FASE 7: NOTIFICATIONS (4-5 horas)

#### 7.1: Notification Service
**Arquivo:**
- `src/core/notifications/service.ts`

**Métodos:**
```typescript
class NotificationService {
  async send(companyId, userId, notification)
  async sendToMultiple(companyId, userIds, notification)
  async sendToRole(companyId, roleId, notification)
  async getNotifications(userId, filters)
  async markAsRead(notificationId, userId)
  async markAllAsRead(userId)
  async delete(notificationId, userId)
}
```

#### 7.2: Adapters
**Arquivos:**
- `src/core/notifications/adapters/internal.adapter.ts`
- `src/core/notifications/adapters/email.adapter.ts`
- `src/core/notifications/adapters/push.adapter.ts`

**Tarefas:**
- [ ] Internal: Salvar em DB
- [ ] Email: Preparar template (sem enviar)
- [ ] Push: Preparar estrutura
- [ ] Cada adapter deve ser injectable

#### 7.3: Endpoints
**Arquivos:**
- `src/app/api/v1/notifications/route.ts`
- `src/app/api/v1/notifications/[id]/route.ts`

**Tarefas:**
- [ ] Listar notificações
- [ ] Marcar como lido
- [ ] Deletar notificação

**Tempo:** 4-5 horas  
**Commits:** 1 ("feat: Implement notification system with adapters")

---

### FASE 8: FEATURE FLAGS & BILLING (4-6 horas)

#### 8.1: Feature Flags Service
**Arquivo:**
- `src/core/feature-flags/service.ts`

**Métodos:**
```typescript
class FeatureFlagService {
  async isEnabled(companyId, key)
  async getFlags(companyId)
  async enableFlag(companyId, key)
  async disableFlag(companyId, key)
  async checkRollout(companyId, percentage)
}
```

#### 8.2: Feature Flags Middleware
**Arquivo:**
- `src/core/feature-flags/middleware.ts`

**Tarefas:**
- [ ] Checar se feature está enabled
- [ ] Rejeitar com 404 se disabled
- [ ] Suportar gradual rollout

#### 8.3: Billing Architecture
**Arquivo:**
- `src/core/billing/service.ts`

**Métodos:**
```typescript
class BillingService {
  async getCurrentPlan(companyId)
  async upgradeToProPlan(companyId, paymentMethod)
  async downgradeToStarterPlan(companyId)
  async cancelSubscription(companyId)
  async validateLimits(companyId, resource)
  async syncWithStripe(companyId, stripeSubscriptionId)
}
```

**Tarefas:**
- [ ] Carregar plano atual
- [ ] Validar limites (usuários, storage, API calls)
- [ ] Preparar para Stripe (não cobrar)
- [ ] Preparar para upgrade/downgrade

#### 8.4: Endpoints
**Arquivos:**
- `src/app/api/v1/feature-flags/route.ts`
- `src/app/api/v1/billing/plan/route.ts`
- `src/app/api/v1/billing/upgrade/route.ts`

**Tempo:** 4-6 horas  
**Commits:** 1 ("feat: Implement feature flags and billing architecture")

---

### FASE 9: FILE STORAGE (3-4 horas)

#### 9.1: Storage Service
**Arquivo:**
- `src/core/storage/service.ts`

**Métodos:**
```typescript
class StorageService {
  async upload(file, companyId, type)
  async delete(fileId, companyId)
  async getFile(fileId, companyId)
  async listFiles(companyId, type)
  async getSignedUrl(fileId, companyId)
  async validateFileSize(size, plan)
}
```

#### 9.2: Adapters
**Arquivos:**
- `src/core/storage/adapters/local.adapter.ts`
- `src/core/storage/adapters/s3.adapter.ts` (placeholder)

#### 9.3: Endpoints
**Arquivos:**
- `src/app/api/v1/files/route.ts`
- `src/app/api/v1/files/[id]/route.ts`

**Tempo:** 3-4 horas  
**Commits:** 1 ("feat: Implement file storage service")

---

### FASE 10: SEARCH (2-3 horas)

#### 10.1: Search Service
**Arquivo:**
- `src/core/search/service.ts`

**Métodos:**
```typescript
class SearchService {
  async search(companyId, query, filters)
  async indexEntity(companyId, resource, entity)
  async reindexAll(companyId)
}
```

#### 10.2: Endpoints
**Arquivos:**
- `src/app/api/v1/search/route.ts`

**Tarefas:**
- [ ] Usar PostgreSQL full-text search por enquanto
- [ ] Preparar para Elasticsearch no futuro
- [ ] Retornar resultados relevantes

**Tempo:** 2-3 horas  
**Commits:** 1 ("feat: Implement search service")

---

### FASE 11: FRONTEND - PAGES (10-12 horas)

#### 11.1: Auth Pages
**Arquivos:**
- `src/app/login/page.tsx`
- `src/app/register/page.tsx`
- `src/app/forgot-password/page.tsx`
- `src/app/reset-password/[token]/page.tsx`
- `src/app/verify-email/[token]/page.tsx`

**Tarefas:**
- [ ] Formulários com Zod validation
- [ ] Loading states
- [ ] Error messages
- [ ] Links para outras páginas
- [ ] Responsive design

#### 11.2: Dashboard
**Arquivos:**
- `src/app/(authenticated)/dashboard/page.tsx`
- `src/app/(authenticated)/dashboard/layout.tsx`

**Tarefas:**
- [ ] Exibir estado vazio elegante se nenhuma empresa
- [ ] Exibir summary se existe empresa
- [ ] Nunca mostrar dados fictícios
- [ ] Loading states
- [ ] Ícones e cores consistentes

#### 11.3: Companies
**Arquivos:**
- `src/app/(authenticated)/companies/page.tsx`
- `src/app/(authenticated)/companies/[id]/page.tsx`
- `src/app/(authenticated)/companies/[id]/settings/page.tsx`

**Tarefas:**
- [ ] Listar empresas
- [ ] Criar empresa (modal)
- [ ] Editar empresa
- [ ] Upload logo
- [ ] Settings
- [ ] Elegant error states

#### 11.4: Users
**Arquivos:**
- `src/app/(authenticated)/users/page.tsx`
- `src/app/(authenticated)/users/[id]/page.tsx`

**Tarefas:**
- [ ] Listar usuários da empresa
- [ ] Criar usuário
- [ ] Editar usuário
- [ ] Atribuir roles
- [ ] Upload avatar
- [ ] Enviar convites

#### 11.5: Security
**Arquivos:**
- `src/app/(authenticated)/security/sessions/page.tsx`
- `src/app/(authenticated)/security/devices/page.tsx`

**Tarefas:**
- [ ] Listar sessões
- [ ] Terminar sessão
- [ ] Listar dispositivos
- [ ] Remover dispositivo

#### 11.6: Audit
**Arquivos:**
- `src/app/(authenticated)/audit/page.tsx`

**Tarefas:**
- [ ] Listar logs
- [ ] Filtros por ação, recurso, data
- [ ] Detalhes do log
- [ ] Export CSV

**Tempo:** 10-12 horas  
**Commits:** 3 ("feat: Add auth pages", "feat: Add dashboard and company pages", "feat: Add user and security pages")

---

### FASE 12: SETTINGS & CONFIGURAÇÕES (2-3 horas)

#### 12.1: Settings Pages
**Arquivos:**
- `src/app/(authenticated)/settings/global/page.tsx`
- `src/app/(authenticated)/settings/company/page.tsx`
- `src/app/(authenticated)/settings/notifications/page.tsx`

**Tarefas:**
- [ ] Editar configurações
- [ ] Salvar preferências
- [ ] Reset para defaults
- [ ] Validação de entrada

**Tempo:** 2-3 horas  
**Commits:** 1 ("feat: Add settings pages")

---

### FASE 13: DOCUMENTAÇÃO (5-6 horas)

#### 13.1: Criar Documentação
**Arquivos:**
- `docs/MASTER_02_ENTITY_MAP.md` - Todas as entidades
- `docs/MASTER_02_PERMISSION_MAP.md` - Todos os roles e permissões
- `docs/MASTER_02_AUTH_FLOW.md` - Fluxograma de autenticação
- `docs/MASTER_02_TENANT_FLOW.md` - Fluxograma de multi-tenancy
- `docs/MASTER_02_RBAC_FLOW.md` - RBAC em detalhe
- `docs/MASTER_02_API.md` - Documentação de endpoints
- `docs/MASTER_02_DATABASE.md` - Schema completo
- `docs/SECURITY_GUIDE.md` - Boas práticas

#### 13.2: Criar Diagramas
**Tarefas:**
- [ ] ER diagram do banco
- [ ] Auth flow diagram
- [ ] Multi-tenant isolation diagram
- [ ] Permission checking diagram

**Tempo:** 5-6 horas  
**Commits:** 1 ("docs: Add MASTER 02 documentation and diagrams")

---

### FASE 14: TESTES (6-8 horas)

#### 14.1: Unit Tests
**Arquivos:**
- `src/core/auth/service.test.ts`
- `src/core/users/service.test.ts`
- `src/core/permissions/service.test.ts`
- `src/core/tenant/service.test.ts`

#### 14.2: Integration Tests
**Arquivos:**
- `src/__tests__/e2e/auth.test.ts`
- `src/__tests__/e2e/multi-tenant.test.ts`
- `src/__tests__/e2e/rbac.test.ts`
- `src/__tests__/e2e/security.test.ts`

#### 14.3: E2E Tests
**Tarefas:**
- [ ] Teste completo: registro → login → dashboard
- [ ] Teste de isolamento: empresa A não vê dados da empresa B
- [ ] Teste de permissões: usuário sem permissão não consegue acessar
- [ ] Teste de segurança: CSRF, rate limiting, etc

**Tempo:** 6-8 horas  
**Commits:** 2 ("test: Add unit and integration tests", "test: Add E2E test suite")

---

### FASE 15: VERIFICAÇÃO FINAL (3-4 horas)

#### 15.1: Build & Type Check
- [ ] `npm run build` sem erros
- [ ] Sem TypeScript warnings
- [ ] Remover `ignoreBuildErrors`
- [ ] Coverage > 70%

#### 15.2: Testes Manuais
- [ ] Fluxo de registro
- [ ] Fluxo de login
- [ ] Criar empresa
- [ ] Adicionar usuário
- [ ] Atribuir role
- [ ] Testar permissões
- [ ] Logout
- [ ] CSRF protection
- [ ] Rate limiting

#### 15.3: Performance
- [ ] Build time < 60s
- [ ] Dev server < 5s
- [ ] Dashboard load < 2s
- [ ] API response < 500ms
- [ ] Database queries otimizadas

#### 15.4: Security Audit
- [ ] Todas as rotas autenticadas
- [ ] Tenant isolation 100%
- [ ] Permissões checadas
- [ ] Logs criados
- [ ] Dados sensíveis não expostos

**Tempo:** 3-4 horas

---

## 📊 TIMELINE TOTAL

| Fase | Tarefa | Tempo | Status |
|------|--------|-------|--------|
| 1 | Database | 4-5h | ⏳ |
| 2 | Auth Service | 8-10h | ⏳ |
| 3 | Multi-Tenant | 6-8h | ⏳ |
| 4 | RBAC | 10-12h | ⏳ |
| 5 | Users | 6-8h | ⏳ |
| 6 | Security | 8-10h | ⏳ |
| 7 | Notifications | 4-5h | ⏳ |
| 8 | Flags & Billing | 4-6h | ⏳ |
| 9 | Storage | 3-4h | ⏳ |
| 10 | Search | 2-3h | ⏳ |
| 11 | Frontend Pages | 10-12h | ⏳ |
| 12 | Settings | 2-3h | ⏳ |
| 13 | Docs | 5-6h | ⏳ |
| 14 | Testes | 6-8h | ⏳ |
| 15 | Verificação | 3-4h | ⏳ |
| **TOTAL** | | **80-105h** | |

**Tempo Real (com breaks, testing, debugging):** 5-7 dias full-time

---

## 🎯 PRÓXIMO PASSO

Após MASTER 02 estar pronto:

1. Merge para master
2. Deploy para staging
3. Testar toda a stack
4. Preparar MASTER 03 (CRM Module)

---

**Status:** ✅ READY FOR IMPLEMENTATION
