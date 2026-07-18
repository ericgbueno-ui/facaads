# ⚡ MASTER 02: QUICK REFERENCE
**Leia isto primeiro - 10 minutos de leitura**

---

## 📋 RESUMO EXECUTIVO

O **MASTER 02** implementa o **CORE** completo do HERGÉ:

| Aspecto | O que inclui |
|---------|-------------|
| **Autenticação** | Login, logout, refresh, password reset, email verification |
| **Multi-Tenant** | Isolamento total de dados, validação em cada layer |
| **RBAC** | 10+ roles predefinidos, permissões granulares |
| **Auditoria** | Log automático de tudo (login, mudanças, deletions) |
| **Segurança** | CSRF, rate limiting, device tracking, session management |
| **Notificações** | Arquitetura para email, push, WhatsApp, SMS |
| **Arquivos** | Upload de logos, avatares, documentos |
| **Feature Flags** | Ativar/desativar features por empresa |
| **Billing** | Preparado para Stripe (sem cobrar ainda) |
| **Pesquisa** | Full-text search em entidades |

**Tempo Total:** 80-105 horas = 5-7 dias full-time

---

## 🗂️ ESTRUTURA DE PASTAS DO CORE

```
src/core/
├── auth/
│   ├── service.ts              # Login, logout, tokens
│   ├── session.service.ts      # Gerenciamento de sessões
│   ├── password.service.ts     # Hash, reset, change
│   ├── middleware.ts           # JWT validation
│   └── validators.ts           # Zod schemas
├── tenant/
│   ├── service.ts              # Tenant context
│   ├── middleware.ts           # Tenant validation
│   └── context.ts              # Tenant types
├── users/
│   ├── service.ts              # User CRUD
│   ├── avatar-service.ts       # Avatar upload
│   └── repository.ts           # User queries
├── permissions/
│   ├── service.ts              # RBAC logic
│   ├── middleware.ts           # Permission checking
│   ├── roles.ts                # Role definitions
│   └── types.ts                # Permission types
├── companies/
│   ├── service.ts              # Company CRUD
│   ├── settings-service.ts     # Company settings
│   └── repository.ts           # Company queries
├── audit/
│   ├── service.ts              # Audit logging
│   ├── middleware.ts           # Auto-logging
│   └── repository.ts           # Audit queries
├── security/
│   ├── csrf.ts                 # CSRF protection
│   ├── headers.ts              # Security headers
│   ├── rate-limit.ts           # Rate limiting
│   ├── device-tracker.ts       # Device tracking
│   └── session-management.ts   # Session control
├── notifications/
│   ├── service.ts              # Notification send
│   ├── adapters/               # Email, push, etc
│   └── repository.ts           # Notification queries
├── storage/
│   ├── service.ts              # File upload
│   ├── adapters/               # S3, local, GCS
│   └── repository.ts           # File queries
├── feature-flags/
│   ├── service.ts              # Feature checking
│   ├── middleware.ts           # Feature gating
│   └── repository.ts           # Flag queries
├── billing/
│   ├── service.ts              # Plan, limits, stripe
│   ├── plans.ts                # Plan definitions
│   └── repository.ts           # Billing queries
├── search/
│   ├── service.ts              # Full-text search
│   ├── adapters/               # PostgreSQL, ES, etc
│   └── indexer.ts              # Reindexing
├── settings/
│   ├── service.ts              # Global settings
│   └── defaults.ts             # Default values
├── config/
│   ├── app.ts                  # Configuration
│   └── constants.ts            # Constants
├── types/
│   ├── auth.ts                 # Auth types
│   ├── tenant.ts               # Tenant types
│   ├── permission.ts           # Permission types
│   └── index.ts
└── index.ts                     # Main exports
```

---

## 🗄️ PRINCIPAIS MODELOS

### User (expandido)
```
id, email, emailVerified, name, surname, title, passwordHash
resetToken, resetTokenExpires, avatar, bio, phone
language, timezone, theme, status
lockUntil, failedLoginAttempts, lastFailedLogin
metadata, preferences, createdAt, updatedAt
```

### Company (expandido)
```
id, name, legalName, fantasyName, cnpj, segment
email, phone, whatsapp, website
instagram, facebook, tiktok, linkedin
address, city, state, country, zipCode
logo, primaryColor, secondaryColor
plan, status, timezone, language
metadata, theme, createdAt, updatedAt, activeAt
```

### Session (novo)
```
id, sessionToken, userId, companyId
expiresAt, lastActivityAt, createdAt
deviceId, ipAddress, userAgent
isActive, metadata
```

### Device (novo)
```
id, userId, deviceId, name, model, os, browser
isActive, lastUsedAt, ipAddress, metadata, createdAt
```

### Role (novo)
```
id, companyId, name, description
isSystem, color, permissions[], createdAt
```

### Permission (novo)
```
id, name, description, category, action, resource
```

### AuditLog (expandido)
```
id, companyId, userId, action, resource, resourceId
changes, description, status, errorMessage
ipAddress, userAgent, deviceId, createdAt
```

### FeatureFlag (novo)
```
id, companyId, name, description, key
isEnabled, rolledOutPercentage
starterEnabled, professionalEnabled, businessEnabled, enterpriseEnabled
metadata, createdAt, updatedAt
```

### BillingPlan (novo)
```
id, companyId, planId, status
startsAt, endsAt, canceledAt
billingEmail, paymentMethod, stripePriceId, stripeSubscriptionId
metadata, createdAt, updatedAt
```

### Notification (novo)
```
id, companyId, type, subject, content
status, sentAt, readAt, failureReason, createdAt
```

### File (novo)
```
id, companyId, name, originalName, mimeType, size
path, url, type, uploadedBy, isPublic, expiresAt
metadata, createdAt, updatedAt, deletedAt
```

---

## 🔌 PRINCIPAIS ENDPOINTS

### Auth (8)
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
GET    /api/v1/auth/me
POST   /api/v1/auth/change-password
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
```

### Companies (8)
```
GET    /api/v1/companies
POST   /api/v1/companies
GET    /api/v1/companies/[id]
PATCH  /api/v1/companies/[id]
DELETE /api/v1/companies/[id]
POST   /api/v1/companies/[id]/logo
GET    /api/v1/companies/[id]/settings
PATCH  /api/v1/companies/[id]/settings
```

### Users (8)
```
GET    /api/v1/users
POST   /api/v1/users
GET    /api/v1/users/[id]
PATCH  /api/v1/users/[id]
DELETE /api/v1/users/[id]
POST   /api/v1/users/[id]/avatar
POST   /api/v1/users/[id]/invite
GET    /api/v1/users/[id]/permissions
```

### Roles (8)
```
GET    /api/v1/roles
POST   /api/v1/roles
GET    /api/v1/roles/[id]
PATCH  /api/v1/roles/[id]
DELETE /api/v1/roles/[id]
POST   /api/v1/roles/[id]/permissions
DELETE /api/v1/roles/[id]/permissions/[p]
GET    /api/v1/permissions
```

### Security (6)
```
GET    /api/v1/security/sessions
DELETE /api/v1/security/sessions/[id]
GET    /api/v1/security/devices
DELETE /api/v1/security/devices/[id]
```

### Audit (4)
```
GET    /api/v1/audit
GET    /api/v1/audit/[id]
GET    /api/v1/audit/user/[userId]
GET    /api/v1/audit/resource/[resource]/[id]
```

---

## 🔐 FLUXOS PRINCIPAIS

### Login Flow
```
1. POST /api/v1/auth/login
2. Validar email/senha
3. Gerar JWT + refresh token
4. Criar Session
5. Enviar cookies (HttpOnly)
6. Registrar AuditLog
7. Retornar usuário + empresa padrão
```

### Multi-Tenant Flow
```
1. Middleware extrai companyId de request
2. Valida que usuário tem acesso à empresa
3. Carrega permissions da empresa
4. Carrega settings da empresa
5. Injeta context em request
6. Service usa context para filtrar dados
7. Repositório adiciona `where: { companyId }`
```

### RBAC Flow
```
1. Middleware carrega permissões do usuário
2. Valida se tem recurso + ação
3. Se não tem → 403 Forbidden
4. Se tem → Prossegue
5. Registra em AuditLog
```

---

## 🧪 PADRÕES DE CÓDIGO

### Service Method
```typescript
async createUser(companyId: string, data: CreateUserInput): Promise<User> {
  // 1. Validar input
  const validated = CreateUserSchema.parse(data);
  
  // 2. Checar permissão
  if (!await this.hasPermission(context, 'users', 'create')) {
    throw new ForbiddenError();
  }
  
  // 3. Executar lógica
  const user = await this.userRepository.create(companyId, validated);
  
  // 4. Registrar auditoria
  await this.auditService.log(companyId, userId, 'create', 'user', {
    before: null,
    after: user,
  });
  
  // 5. Notificar (opcionalmente)
  await this.notificationService.sendToRole(companyId, 'admin', {
    type: 'internal',
    subject: 'Novo usuário',
    content: `${user.name} foi adicionado`,
  });
  
  return user;
}
```

### API Endpoint
```typescript
export async function POST(req: NextRequest, { params }: RequestParams) {
  // 1. Autenticar
  return requireAuth(req, async (auth) => {
    // 2. Validar tenant
    const context = await validateTenantAccess(auth.userId, params.companyId);
    
    // 3. Parsear input
    const data = await req.json();
    
    // 4. Chamar service
    const result = await userService.createUser(context.companyId, data);
    
    // 5. Retornar resposta
    return Response.json({ data: result }, { status: 201 });
  });
}
```

### Permission Check
```typescript
export async function requirePermission(resource: string, action: string) {
  return async (req: NextRequest, handler: Handler) => {
    const auth = await extractContext(req);
    
    if (!await permissionService.hasPermission(
      auth.userId,
      auth.companyId,
      resource,
      action
    )) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    return handler();
  };
}
```

---

## ✅ TESTES MANUAIS ESSENCIAIS

Após implementar cada fase:

### Fase 2 (Auth)
- [ ] Login com email/senha
- [ ] Logout
- [ ] Refresh token
- [ ] Reset password
- [ ] Bloqueio após 5 tentativas

### Fase 3 (Tenant)
- [ ] User A não vê dados de User B
- [ ] Empresa A não acessa dados de Empresa B
- [ ] Request sem companyId é rejeitado

### Fase 4 (RBAC)
- [ ] Admin pode fazer tudo
- [ ] Manager pode ver mas não deletar
- [ ] Viewer não pode editar
- [ ] Permissão é respeitada

### Fase 6 (Security)
- [ ] AuditLog criado em cada ação
- [ ] Device tracking funciona
- [ ] Rate limiting para login
- [ ] CSRF token validado

---

## 🚨 ERROS COMUNS A EVITAR

❌ **Fazer query sem tenant filter**
```typescript
// ERRADO
const users = await prisma.user.findMany();

// CORRETO
const users = await prisma.user.findMany({
  where: { companyUsers: { some: { companyId } } }
});
```

❌ **Retornar token em URL**
```typescript
// ERRADO
res.redirect(`/reset-password?token=${token}`);

// CORRETO
// Usar cookie ou POST request
```

❌ **Salvar senha em plain text**
```typescript
// ERRADO
user.password = data.password;

// CORRETO
user.passwordHash = await bcrypt.hash(data.password, 10);
```

❌ **Não validar permissão**
```typescript
// ERRADO
async deleteUser(userId) {
  return prisma.user.delete({ where: { id: userId } });
}

// CORRETO
async deleteUser(companyId, userId, context) {
  if (!await this.hasPermission(context, 'users', 'delete')) {
    throw new ForbiddenError();
  }
  return prisma.user.delete({ where: { id: userId, companyId } });
}
```

❌ **Logs sem tenant**
```typescript
// ERRADO
logger.info('User created');

// CORRETO
auditService.log(companyId, userId, 'create', 'user', data);
```

---

## 📱 PÁGINAS PRINCIPAIS

### Public
- `/login` - Login
- `/register` - Registro
- `/forgot-password` - Recuperar senha

### Authenticated
- `/dashboard` - Dashboard principal
- `/companies` - Gestão de empresas
- `/users` - Gestão de usuários
- `/roles` - Gestão de roles
- `/security/sessions` - Gerenciar sessões
- `/security/devices` - Gerenciar dispositivos
- `/audit` - Ver logs de auditoria
- `/settings` - Configurações

---

## 🔄 COMMITS ESPERADOS

```
1. feat: Add MASTER 02 database schema
2. feat: Implement auth service and endpoints
3. feat: Implement tenant service and isolation
4. feat: Implement RBAC system and endpoints
5. feat: Implement user management service
6. feat: Implement audit and security services
7. feat: Implement notification system
8. feat: Implement feature flags and billing
9. feat: Implement file storage service
10. feat: Implement search service
11. feat: Add authentication pages
12. feat: Add dashboard and company pages
13. feat: Add user and security pages
14. feat: Add settings pages
15. docs: Add MASTER 02 documentation
16. test: Add unit and integration tests
17. test: Add E2E test suite
```

---

## 🎯 ORDEM DE IMPLEMENTAÇÃO RECOMENDADA

1. **Database** - Sem banco, nada funciona
2. **Auth** - Sem autenticação, usuário não entra
3. **Tenant** - Sem isolamento, dados vazam
4. **RBAC** - Sem permissões, segurança falha
5. **Users** - Sem gestão de usuários, não consegue gerenciar
6. **Security** - Sem logs, não consegue auditar
7. **Notifications** - Sistema de notificações
8. **Feature Flags** - Ativar/desativar features
9. **Storage** - Upload de arquivos
10. **Search** - Pesquisa global
11. **Frontend** - Páginas para tudo
12. **Testes** - Validar tudo funciona
13. **Docs** - Documentar tudo

---

## 💾 ANTES DE COMEÇAR

- [ ] Ler `MASTER_02_ARCHITECTURE.md` (compreender design)
- [ ] Ler `MASTER_02_IMPLEMENTATION_PLAN.md` (compreender plano)
- [ ] Criar branch: `master-02-core-platform`
- [ ] Verificar `npm run build` passa
- [ ] Database conectado (Neon)
- [ ] Backup do .env.local

---

## 🚀 COMEÇAR AGORA

```bash
cd "C:\projetos ia\herge"
git checkout -b master-02-core-platform

# Fase 1: Database
# Seguir MASTER_02_IMPLEMENTATION_PLAN.md Fase 1

npx prisma migrate dev --name "add_core_models"
npm run build  # Deve passar
```

---

**Boa sorte! 🚀**

Dúvidas? Consulte os documentos principais.
