# 🏗️ MASTER 02: CORE PLATFORM ARCHITECTURE
**Data:** 2026-07-18  
**Versão:** 2.0  
**Escopo:** Plataforma SaaS Multi-Tenant Enterprise  
**Status:** Design Phase

---

## 📋 VISÃO GERAL

O **MASTER 02** implementará o **CORE** completo do sistema - a fundação que suporta qualquer plataforma SaaS multi-tenant com centenas de milhares de empresas operando simultaneamente.

**Princípio Fundamental:** O CORE será totalmente **independente de domínio de negócio**. Qualquer módulo futuro (CRM, Marketing, WhatsApp) apenas **consome** os serviços do CORE.

---

## 🎯 OBJETIVOS DO MASTER 02

### ✅ Autenticação Robusta
- Login/Logout seguro
- Refresh token automático
- Remember me
- Recuperação de senha
- Primeiro acesso
- Verificação de email
- Bloqueio por tentativas
- Controle de sessões

### ✅ Multi-Tenant Bulletproof
- Isolamento total de dados
- Row-level security
- Context propagation
- Validação em todos endpoints
- Nenhuma query sem tenant

### ✅ Gestão de Usuários
- Cadastro de usuários
- Perfis avançados
- Avatares e customização
- Idioma/Timezone/Tema por usuário
- Último acesso tracking

### ✅ RBAC Completo
- 10+ roles predefinidas
- Permissões granulares
- Grupos personalizados
- Herança de permissões
- Permission checking middleware

### ✅ Gestão de Empresas
- Cadastro completo
- Customização (cores, logo)
- Segmentação
- Status management
- Meta informações

### ✅ Segurança Enterprise
- CSRF protection
- Headers de segurança
- Cookies seguros
- Rate limiting
- IP whitelisting (opcional)
- Device tracking

### ✅ Auditoria Completa
- Logging automático de tudo
- Trail de mudanças
- Rastreamento de usuário
- IP e Device salvos
- Timestamps precisos

### ✅ Notificações
- Arquitetura extensível
- Email ready
- Push ready
- WhatsApp ready
- SMS ready
- Internas (in-app)

### ✅ Gestão de Arquivos
- Upload seguro
- Logos por empresa
- Avatares por usuário
- Documentos
- Versionamento
- Storage abstraction

### ✅ Feature Flags
- Ativação/desativação por empresa
- Cada módulo pode ser ligado/desligado
- A/B testing ready
- Gradual rollout ready

### ✅ Planos & Billing
- Arquitetura preparada
- Limite de resources por plano
- Validation de planos
- Upgrade/downgrade ready
- Stripe integration ready

### ✅ Dashboard Principal
- Estado vazio elegante
- Dados sempre reais
- Sem mocks
- Responsivo
- Velocidade ótima

### ✅ Pesquisa Global
- Infraestrutura preparada
- Full-text search ready
- Elasticsearch ready
- Elastic filters
- Relevância scoring

---

## 🏛️ ESTRUTURA DO CORE

A estrutura do MASTER 01 será expandida:

```
src/core/
├── auth/
│   ├── middleware.ts               # Middleware de autenticação
│   ├── service.ts                  # AuthService
│   ├── session.service.ts          # Gerenciamento de sessões
│   ├── password.service.ts         # Hash, reset, change
│   ├── mfa.service.ts              # Multi-factor auth (futuro)
│   ├── validators.ts               # Zod schemas
│   ├── types.ts
│   └── index.ts
│
├── tenant/
│   ├── middleware.ts               # Validação de tenant
│   ├── service.ts                  # TenantService
│   ├── context.ts                  # TenantContext
│   ├── repository.ts               # TenantRepository
│   ├── validators.ts
│   ├── types.ts
│   └── index.ts
│
├── users/
│   ├── service.ts                  # UserService
│   ├── repository.ts               # UserRepository
│   ├── validators.ts
│   ├── types.ts
│   ├── avatar-service.ts           # Avatar upload
│   └── index.ts
│
├── permissions/
│   ├── service.ts                  # PermissionService (RBAC)
│   ├── repository.ts               # PermissionRepository
│   ├── roles.ts                    # Role definitions
│   ├── middleware.ts               # Permission checking
│   ├── validators.ts
│   ├── types.ts
│   └── index.ts
│
├── companies/
│   ├── service.ts                  # CompanyService
│   ├── repository.ts               # CompanyRepository
│   ├── settings-service.ts         # Configurações por empresa
│   ├── validators.ts
│   ├── types.ts
│   └── index.ts
│
├── audit/
│   ├── service.ts                  # AuditService
│   ├── repository.ts               # AuditRepository
│   ├── middleware.ts               # Auto-logging
│   ├── types.ts
│   └── index.ts
│
├── security/
│   ├── csrf.ts                     # CSRF protection
│   ├── headers.ts                  # Security headers
│   ├── rate-limit.ts               # Rate limiting
│   ├── ip-filter.ts                # IP filtering (opcional)
│   ├── device-tracker.ts           # Device tracking
│   ├── session-management.ts       # Sessão única, logout em outros devices
│   └── index.ts
│
├── notifications/
│   ├── service.ts                  # NotificationService
│   ├── adapters/
│   │   ├── email.adapter.ts
│   │   ├── push.adapter.ts
│   │   ├── whatsapp.adapter.ts
│   │   ├── sms.adapter.ts
│   │   └── internal.adapter.ts
│   ├── queue.ts                    # Message queue (Bull/Redis)
│   ├── repository.ts               # NotificationRepository
│   ├── validators.ts
│   ├── types.ts
│   └── index.ts
│
├── storage/
│   ├── service.ts                  # StorageService (abstraction)
│   ├── adapters/
│   │   ├── s3.adapter.ts           # AWS S3
│   │   ├── local.adapter.ts        # Local filesystem
│   │   └── gcs.adapter.ts          # Google Cloud Storage
│   ├── repository.ts               # FileRepository
│   ├── types.ts
│   └── index.ts
│
├── feature-flags/
│   ├── service.ts                  # FeatureFlagService
│   ├── repository.ts               # FeatureFlagRepository
│   ├── middleware.ts               # Feature checking
│   ├── validators.ts
│   ├── types.ts
│   └── index.ts
│
├── billing/
│   ├── service.ts                  # BillingService
│   ├── repository.ts               # BillingRepository
│   ├── plans.ts                    # Plan definitions
│   ├── validators.ts
│   ├── types.ts
│   └── index.ts
│
├── search/
│   ├── service.ts                  # SearchService
│   ├── adapters/
│   │   ├── postgres.adapter.ts     # PostgreSQL full-text
│   │   ├── elasticsearch.adapter.ts
│   │   └── meilisearch.adapter.ts
│   ├── indexer.ts                  # Reindexing
│   ├── types.ts
│   └── index.ts
│
├── settings/
│   ├── service.ts                  # SettingsService
│   ├── repository.ts               # SettingsRepository
│   ├── defaults.ts                 # Configurações padrão
│   ├── validators.ts
│   ├── types.ts
│   └── index.ts
│
├── config/
│   ├── app.ts                      # App configuration
│   ├── constants.ts                # Constantes globais
│   └── types.ts
│
├── types/
│   ├── auth.ts                     # Auth types
│   ├── tenant.ts                   # Tenant types
│   ├── user.ts                     # User types
│   ├── permission.ts               # Permission types
│   ├── index.ts
│   └── common.ts
│
└── index.ts                         # Main exports
```

---

## 📊 MODELOS DO BANCO DE DADOS

### Expansão de Modelos (10+ novos)

#### **Empresas**
```prisma
model Company {
  id                    String   @id @default(cuid())
  
  // Básico
  name                  String
  legalName             String?
  fantasyName           String?
  cnpj                  String?   @unique
  segment               String    @default("other")
  
  // Contato
  email                 String
  phone                 String?
  whatsapp              String?
  website               String?
  
  // Redes Sociais
  instagram             String?
  facebook              String?
  tiktok                String?
  linkedin              String?
  
  // Endereço
  address               String?
  city                  String?
  state                 String?
  country               String    @default("BR")
  zipCode               String?
  
  // Customização
  logo                  String?
  primaryColor          String?   @default("#3b82f6")
  secondaryColor        String?   @default("#8b5cf6")
  
  // Gestão
  plan                  String    @default("starter")
  status                String    @default("active")
  timezone              String    @default("America/Sao_Paulo")
  language              String    @default("pt-BR")
  
  // Metadata
  metadata              Json?
  theme                 String    @default("light")
  
  // Rastreamento
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  activeAt              DateTime?
  
  // Relações
  users                 CompanyUser[]
  settings              CompanySettings?
  auditLogs             AuditLog[]
  notifications         Notification[]
  featureFlags          FeatureFlag[]
  billingPlan           BillingPlan?
  files                 File[]
  searchIndex           SearchIndex?
  
  @@index([status])
  @@index([plan])
  @@index([createdAt])
}
```

#### **Usuários Expandido**
```prisma
model User {
  id                String        @id @default(cuid())
  
  // Básico
  email             String        @unique
  emailVerified     DateTime?
  name              String
  surname           String?
  title             String?       // Cargo
  
  // Autenticação
  passwordHash      String?
  resetToken        String?
  resetTokenExpires DateTime?
  lastLogin         DateTime?
  
  // Avatar e Perfil
  avatar            String?
  bio               String?
  phone             String?
  
  // Preferências
  language          String        @default("pt-BR")
  timezone          String        @default("America/Sao_Paulo")
  theme             String        @default("light")
  
  // Status
  status            String        @default("active")
  emailVerificationToken String?
  emailVerificationExpires DateTime?
  
  // Segurança
  lockUntil         DateTime?
  failedLoginAttempts Int?        @default(0)
  lastFailedLogin   DateTime?
  
  // Metadata
  metadata          Json?
  preferences       Json?
  
  // Rastreamento
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  
  // Relações
  accounts          Account[]
  sessions          Session[]
  companyUsers      CompanyUser[]
  auditLogs         AuditLog[]
  notifications     UserNotification[]
  devices           Device[]
  
  @@index([email])
  @@index([status])
}
```

#### **Permissões Expandidas**
```prisma
model Role {
  id                String    @id @default(cuid())
  companyId         String    // Roles globais e por empresa
  name              String
  description       String?
  isSystem          Boolean   @default(false)
  color             String?
  
  permissions       RolePermission[]
  companyUsers      CompanyUser[]
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@unique([companyId, name])
  @@index([companyId])
}

model Permission {
  id                String    @id @default(cuid())
  name              String    @unique
  description       String?
  category          String    // auth, users, companies, audit, etc
  action            String    // view, create, edit, delete, export, import
  resource          String    // user, company, lead, etc
  
  roles             RolePermission[]
  
  @@index([category])
  @@index([resource])
}

model RolePermission {
  id                String    @id @default(cuid())
  roleId            String
  permissionId      String
  grantedAt         DateTime  @default(now())
  
  role              Role      @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission        Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  
  @@unique([roleId, permissionId])
}
```

#### **Sessões Expandidas**
```prisma
model Session {
  id                String    @id @default(cuid())
  sessionToken      String    @unique
  userId            String
  companyId         String?
  
  // Dados de Sessão
  expiresAt         DateTime
  lastActivityAt    DateTime  @default(now())
  createdAt         DateTime  @default(now())
  
  // Dispositivo
  deviceId          String?
  ipAddress         String?
  userAgent         String?
  
  // Segurança
  isActive          Boolean   @default(true)
  
  // Metadata
  metadata          Json?
  
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  device            Device?   @relation(fields: [deviceId], references: [id], onDelete: SetNull)
  
  @@index([userId])
  @@index([companyId])
  @@index([expiresAt])
  @@index([isActive])
}
```

#### **Dispositivos**
```prisma
model Device {
  id                String    @id @default(cuid())
  userId            String
  
  // Identificação
  deviceId          String
  name              String?
  model             String?
  os                String?
  browser           String?
  
  // Segurança
  isActive          Boolean   @default(true)
  lastUsedAt        DateTime?
  ipAddress         String?
  
  // Metadata
  metadata          Json?
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  sessions          Session[]
  
  @@unique([userId, deviceId])
  @@index([userId])
}
```

#### **Auditoria Expandida**
```prisma
model AuditLog {
  id                String    @id @default(cuid())
  companyId         String
  userId            String?
  
  // Ação
  action            String    // login, logout, create, update, delete, permission_change
  resource          String    // user, company, lead, etc
  resourceId        String?
  
  // Dados
  changes           Json?     // {before: {}, after: {}}
  description       String?
  status            String    @default("success") // success, failure
  errorMessage      String?
  
  // Segurança
  ipAddress         String?
  userAgent         String?
  deviceId          String?
  
  // Rastreamento
  createdAt         DateTime  @default(now())
  
  company           Company   @relation(fields: [companyId], references: [id], onDelete: Cascade)
  user              User?     @relation(fields: [userId], references: [id], onDelete: SetNull)
  
  @@index([companyId])
  @@index([action])
  @@index([resource])
  @@index([createdAt])
  @@index([companyId, createdAt])
}
```

#### **Feature Flags**
```prisma
model FeatureFlag {
  id                String    @id @default(cuid())
  companyId         String?   // null = global
  
  name              String
  description       String?
  key               String    @unique
  
  isEnabled         Boolean   @default(false)
  rolledOutPercentage Int?    // 0-100 para gradual rollout
  
  // Limites por plano
  starterEnabled    Boolean   @default(false)
  professionalEnabled Boolean @default(false)
  businessEnabled   Boolean   @default(false)
  enterpriseEnabled Boolean   @default(true)
  
  // Metadata
  metadata          Json?
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  company           Company?  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  @@unique([companyId, key])
  @@index([companyId])
}
```

#### **Planos e Billing**
```prisma
model Plan {
  id                String    @id @default(cuid())
  name              String    @unique
  displayName       String
  description       String?
  
  // Pricing
  monthlyPrice      Decimal   @db.Decimal(10, 2)
  yearlyPrice       Decimal   @db.Decimal(10, 2)
  currency          String    @default("BRL")
  
  // Limites
  maxUsers          Int
  maxCompanies      Int
  maxApiCalls       Int       @default(100000)
  maxStorage        Int       // GB
  
  // Features
  features          Json      // Array de features habilitadas
  
  order             Int       // Para ordenação
  isPopular         Boolean   @default(false)
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  billingPlans      BillingPlan[]
}

model BillingPlan {
  id                String    @id @default(cuid())
  companyId         String    @unique
  planId            String
  
  status            String    @default("active") // active, canceled, past_due
  
  // Período
  startsAt          DateTime
  endsAt            DateTime?
  canceledAt        DateTime?
  
  // Cobrança
  billingEmail      String?
  paymentMethod     String?
  stripePriceId     String?
  stripeSubscriptionId String?
  
  metadata          Json?
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  company           Company   @relation(fields: [companyId], references: [id], onDelete: Cascade)
  plan              Plan      @relation(fields: [planId], references: [id])
  
  @@index([companyId])
  @@index([status])
}
```

#### **Notificações**
```prisma
model Notification {
  id                String    @id @default(cuid())
  companyId         String
  
  type              String    // email, push, whatsapp, sms, internal
  subject           String?
  content           String
  
  status            String    @default("pending") // pending, sent, failed, read
  
  // Rastreamento
  sentAt            DateTime?
  readAt            DateTime?
  failureReason     String?
  
  createdAt         DateTime  @default(now())
  
  company           Company   @relation(fields: [companyId], references: [id], onDelete: Cascade)
  recipients        UserNotification[]
  
  @@index([companyId])
  @@index([status])
  @@index([createdAt])
}

model UserNotification {
  id                String    @id @default(cuid())
  notificationId    String
  userId            String
  
  isRead            Boolean   @default(false)
  readAt            DateTime?
  
  createdAt         DateTime  @default(now())
  
  notification      Notification @relation(fields: [notificationId], references: [id], onDelete: Cascade)
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([notificationId, userId])
  @@index([userId])
  @@index([isRead])
}
```

#### **Arquivos**
```prisma
model File {
  id                String    @id @default(cuid())
  companyId         String
  
  name              String
  originalName      String
  mimeType          String
  size              Int
  
  path              String    // s3://bucket/path ou /local/path
  url               String?   // URL pública
  
  type              String    // avatar, logo, document, image, other
  uploadedBy        String?
  
  isPublic          Boolean   @default(false)
  expiresAt         DateTime?
  
  metadata          Json?
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  deletedAt         DateTime?
  
  company           Company   @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  @@index([companyId])
  @@index([type])
  @@index([createdAt])
}
```

#### **Configurações**
```prisma
model CompanySettings {
  id                String    @id @default(cuid())
  companyId         String    @unique
  
  // Segurança
  requireMFA        Boolean   @default(false)
  passwordMinLength Int       @default(8)
  sessionTimeout    Int       @default(3600) // segundos
  maxLoginAttempts  Int       @default(5)
  lockDuration      Int       @default(900) // segundos
  
  // Notificações
  notificationsEnabled Boolean @default(true)
  emailNotifications Boolean @default(true)
  pushNotifications Boolean @default(true)
  
  // Customização
  theme             String    @default("light")
  language          String    @default("pt-BR")
  
  // Metadata
  metadata          Json?
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  company           Company   @relation(fields: [companyId], references: [id], onDelete: Cascade)
}
```

#### **Pesquisa (Search Index)**
```prisma
model SearchIndex {
  id                String    @id @default(cuid())
  companyId         String    @unique
  
  // Índices
  lastIndexedAt     DateTime?
  totalDocuments    Int       @default(0)
  
  // Config
  searchProvider    String    @default("postgres") // postgres, elasticsearch, meilisearch
  indexName         String?
  
  metadata          Json?
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  company           Company   @relation(fields: [companyId], references: [id], onDelete: Cascade)
}
```

---

## 🔐 FLUXOS DE SEGURANÇA

### Fluxo de Autenticação
```
Usuario -> Login Page
         -> Validação de Email
         -> Hash de Senha (bcrypt)
         -> Geração de JWT (access + refresh)
         -> Criação de Session
         -> Device Tracking
         -> Audit Log
         -> Cookie Seguro (HttpOnly, Secure, SameSite)
         -> Dashboard
```

### Fluxo de Multi-Tenant
```
Request -> Middleware de Auth
        -> Validação de Tenant (companyId)
        -> Verificação de Acesso (RBAC)
        -> Injeção de Context
        -> Service (com tenant validado)
        -> Repository (com filter de tenant)
        -> Response (dados isolados)
```

### Fluxo de Autorização
```
Request -> Extract Token
        -> Validate Signature
        -> Check Expiration
        -> Load Company Context
        -> Load User Permissions
        -> Check Resource Access
        -> Check Action Permission
        -> Proceed or 403 Forbidden
```

---

## 📱 PÁGINAS DO CORE

### Públicas
- `/login` - Login com email/senha
- `/forgot-password` - Recuperar senha
- `/reset-password/[token]` - Resetar senha
- `/verify-email/[token]` - Verificar email
- `/404` - Página não encontrada
- `/500` - Erro servidor

### Autenticadas (Master)
- `/dashboard` - Dashboard principal
- `/companies` - Gestão de empresas
- `/users` - Gestão de usuários
- `/roles` - Gestão de roles
- `/settings` - Configurações globais
- `/audit` - Logs de auditoria
- `/notifications` - Central de notificações
- `/profile` - Perfil do usuário
- `/security` - Segurança (sessões, dispositivos)

### Por Empresa
- `/companies/[id]/dashboard` - Dashboard da empresa
- `/companies/[id]/settings` - Configurações da empresa
- `/companies/[id]/users` - Usuários da empresa
- `/companies/[id]/roles` - Roles da empresa
- `/companies/[id]/audit` - Auditoria da empresa
- `/companies/[id]/billing` - Plano e cobrança
- `/companies/[id]/integrations` - Integrações

---

## 🔌 API ENDPOINTS DO CORE

### Auth (8-10 endpoints)
```
POST   /api/v1/auth/register            # Registro de novo usuário
POST   /api/v1/auth/login               # Login
POST   /api/v1/auth/logout              # Logout
POST   /api/v1/auth/refresh             # Refresh token
POST   /api/v1/auth/forgot-password     # Solicitar reset
POST   /api/v1/auth/reset-password      # Executar reset
POST   /api/v1/auth/verify-email        # Verificar email
GET    /api/v1/auth/me                  # Dados do usuário atual
POST   /api/v1/auth/change-password     # Alterar senha
```

### Companies (8-10 endpoints)
```
GET    /api/v1/companies                # Listar (usuário)
POST   /api/v1/companies                # Criar nova
GET    /api/v1/companies/[id]           # Detalhes
PATCH  /api/v1/companies/[id]           # Editar
DELETE /api/v1/companies/[id]           # Deletar
POST   /api/v1/companies/[id]/logo      # Upload logo
GET    /api/v1/companies/[id]/settings  # Configurações
PATCH  /api/v1/companies/[id]/settings  # Editar configurações
```

### Users (10-12 endpoints)
```
GET    /api/v1/users                    # Listar (by company)
POST   /api/v1/users                    # Criar
GET    /api/v1/users/[id]               # Detalhes
PATCH  /api/v1/users/[id]               # Editar
DELETE /api/v1/users/[id]               # Deletar
POST   /api/v1/users/[id]/avatar        # Upload avatar
POST   /api/v1/users/[id]/invite        # Enviar convite
GET    /api/v1/users/[id]/permissions  # Permissões do usuário
```

### Roles & Permissions (12-15 endpoints)
```
GET    /api/v1/roles                    # Listar roles
POST   /api/v1/roles                    # Criar role
GET    /api/v1/roles/[id]               # Detalhes
PATCH  /api/v1/roles/[id]               # Editar
DELETE /api/v1/roles/[id]               # Deletar

GET    /api/v1/permissions              # Listar permissões
POST   /api/v1/roles/[id]/permissions  # Adicionar permissão
DELETE /api/v1/roles/[id]/permissions/[p] # Remover permissão
```

### Audit (4-5 endpoints)
```
GET    /api/v1/audit                    # Listar logs
GET    /api/v1/audit/[id]               # Detalhes
GET    /api/v1/audit/user/[userId]     # Logs de usuário
GET    /api/v1/audit/resource/[resource]/[id] # Logs de recurso
```

### Security (6-8 endpoints)
```
GET    /api/v1/security/sessions        # Listar sessões
DELETE /api/v1/security/sessions/[id]  # Terminar sessão
GET    /api/v1/security/devices        # Listar dispositivos
DELETE /api/v1/security/devices/[id]   # Remover dispositivo
POST   /api/v1/security/change-password # Mudar senha
```

### Notifications (6-8 endpoints)
```
GET    /api/v1/notifications            # Listar notificações
GET    /api/v1/notifications/[id]       # Detalhes
PATCH  /api/v1/notifications/[id]       # Marcar como lido
DELETE /api/v1/notifications/[id]       # Deletar
GET    /api/v1/notifications/unread-count # Contador
POST   /api/v1/notifications/mark-all-read # Marcar todas
```

### Feature Flags (4-6 endpoints)
```
GET    /api/v1/feature-flags            # Listar flags
GET    /api/v1/feature-flags/[key]     # Detalhes
PATCH  /api/v1/feature-flags/[key]     # Atualizar
```

### Search (2-3 endpoints)
```
GET    /api/v1/search                   # Busca global
GET    /api/v1/search/[resource]       # Busca por recurso
```

### Settings (4-5 endpoints)
```
GET    /api/v1/settings                 # Configurações globais
PATCH  /api/v1/settings                 # Editar
GET    /api/v1/settings/company         # Configurações da empresa
PATCH  /api/v1/settings/company         # Editar
```

---

## 🛡️ PADRÕES DE SEGURANÇA

### Middleware Stack
```typescript
[
  csrfProtection,        // CSRF token validation
  securityHeaders,       // Security headers
  rateLimiter,           // Rate limiting
  authenticationCheck,   // JWT validation
  tenantValidation,      // Multi-tenant isolation
  permissionCheck,       // RBAC validation
  auditLogger,           // Logging automático
  errorHandler,          // Tratamento de erros
]
```

### RBAC Granular
```
Resource: User
- view:user
- create:user
- edit:user
- delete:user
- export:user
- import:user

Resource: Company
- view:company
- edit:company
- delete:company
- manage:company (tudo acima)
- invite:company
```

### Validação de Tenant
```typescript
// Toda query deve incluir companyId
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { companyUsers: { where: { companyId } } }
})

// Nunca permitir query sem context
```

---

## 📊 PERFORMANCE & SCALING

### Índices Críticos
```
User:        email, status, createdAt
Company:     status, plan, createdAt
AuditLog:    companyId, action, createdAt (compound)
Session:     userId, isActive, expiresAt
Device:      userId, isActive
Notification: companyId, status, createdAt
File:        companyId, type, createdAt
```

### Caching Strategy
```
SessionService    -> Redis (TTL: 24h)
PermissionService -> Redis (TTL: 1h)
CompanyService    -> Redis (TTL: 1h)
SettingsService   -> Redis (TTL: 6h)
FeatureFlagService-> Redis (TTL: 5m)
```

### Query Optimization
```
- Usar select para trazer apenas campos necessários
- Implementar cursor-based pagination
- Usar índices compostos para filtros comuns
- Lazy-load relações desnecessárias
- Connection pooling (Prisma + Neon)
```

---

## 🧪 ESTRUTURA DE TESTES

### Unit Tests
```
core/auth/service.test.ts
core/users/service.test.ts
core/permissions/service.test.ts
core/tenant/service.test.ts
```

### Integration Tests
```
e2e/auth.test.ts          # Login flow
e2e/multi-tenant.test.ts  # Isolation test
e2e/permissions.test.ts   # RBAC test
e2e/security.test.ts      # Security validations
```

### E2E Tests
```
e2e/complete-flow.test.ts # Registro até dashboard
```

---

## 📝 DOCUMENTAÇÃO FINAL

O MASTER 02 gerará:

1. **Entity Map** - Todas as entidades e relacionamentos
2. **Permission Map** - Todos os roles e permissões
3. **Auth Flow** - Fluxograma de autenticação
4. **Tenant Flow** - Fluxograma de multi-tenancy
5. **Session Flow** - Gerenciamento de sessões
6. **Authorization Flow** - RBAC em detalhe
7. **API Documentation** - Todos os endpoints
8. **Database Schema** - ER diagram completo
9. **Security Guide** - Boas práticas
10. **Deployment Guide** - Como fazer deploy

---

## 🎯 PRÓXIMO: MASTER 03

Após MASTER 02 estar pronto:

- CRM Module
- Marketing Module
- WhatsApp Integration
- Financeiro Module
- BI/Analytics
- IA Integration

Cada módulo apenas **consome** os serviços do CORE.

---

## ✅ CHECKLIST MASTER 02

- [ ] Todos os modelos criados
- [ ] Todas as migrations executadas
- [ ] AuthService implementado
- [ ] TenantService implementado
- [ ] UserService implementado
- [ ] PermissionService implementado
- [ ] Middleware padronizado
- [ ] Endpoints de Auth
- [ ] Endpoints de Companies
- [ ] Endpoints de Users
- [ ] Endpoints de Roles
- [ ] Endpoints de Audit
- [ ] Feature Flags
- [ ] Billing Architecture
- [ ] Notifications Architecture
- [ ] File Storage
- [ ] Dashboard vazio elegante
- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Documentação completa
- [ ] Segurança verificada
- [ ] Performance validada
- [ ] Ready para produção

---

**Status:** ✅ DESIGN COMPLETE - PRONTO PARA IMPLEMENTAÇÃO
