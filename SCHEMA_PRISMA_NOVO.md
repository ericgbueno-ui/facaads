# 🗄️ NOVO SCHEMA PRISMA - HERGÉ AGENCY

## 📊 Visão Geral das Adições

O schema atual possui 6 modelos. Será adicionado **11 novos modelos** mantendo os existentes e estendendo 4 deles.

---

## 🏢 BLOCO 1: EMPRESAS & USUÁRIOS

```prisma
// Empresa - O núcleo do multi-tenancy
model Company {
  id                String    @id @default(cuid())
  
  // Informações básicas
  name              String
  segment           String    // turismo, colchões, clínicas, etc
  logo              String?   // URL da logo
  status            String    @default("active") // active, inactive, archived
  
  // Contatos
  responsibleName   String?
  phone             String?
  whatsapp          String?
  city              String?
  state             String?
  
  // URLs
  website           String?
  instagram         String?
  facebook          String?
  tiktok            String?
  shopee            String?
  googleBusiness    String?
  
  // Meta
  notes             String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relacionamentos
  users             CompanyUser[]
  leads             Lead[]
  adAccounts        AdAccount[]        // Override de canal
  campaigns         Campaign[]         // Override de canal
  conversions       ConversionEvent[]  // Override de canal
  crmPipelines      CRMPipeline[]
  whatsappConversations WhatsAppConversation[]
  sales             Sale[]
  integrations      CompanyIntegration[]
  auditLogs         AuditLog[]
  reports           Report[]
  
  @@index([status])
  @@index([segment])
  @@fulltext([name]) // MySQL fulltext search (optional)
}

// Usuário da Empresa - Relacionamento N:N
model CompanyUser {
  id                String    @id @default(cuid())
  
  userId            String
  companyId         String
  
  // Permissões
  role              String    @default("analyst") // admin, manager, analyst, finance
  isOwner           Boolean   @default(false)
  
  // Meta
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relacionamentos
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  company           Company   @relation(fields: [companyId], references: [id], onDelete: Cascade)
  permissions       CompanyUserPermission[]
  auditLogs         AuditLog[]
  
  @@unique([userId, companyId])
  @@index([companyId])
  @@index([role])
}

// Permissões - Baseado em Roles
model Permission {
  id                String    @id @default(cuid())
  
  name              String    @unique  // read:leads, write:leads, etc
  description       String?
  category          String    // leads, sales, integrations, users, etc
  
  // Relacionamentos
  companyUsers      CompanyUserPermission[]
}

// User Permission - Permissões customizáveis
model CompanyUserPermission {
  id                String    @id @default(cuid())
  
  companyUserId     String
  permissionId      String
  
  grantedAt         DateTime  @default(now())
  
  // Relacionamentos
  companyUser       CompanyUser @relation(fields: [companyUserId], references: [id], onDelete: Cascade)
  permission        Permission  @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  
  @@unique([companyUserId, permissionId])
}

// Estender modelo User existente
model User {
  // ... campos existentes ...
  
  // Adicionado
  defaultCompanyId  String?  // Empresa padrão ao login
  companyUsers      CompanyUser[]
  auditLogs         AuditLog[]
  
  @@index([email])
}

// Estender modelo AdAccount existente
model AdAccount {
  // ... campos existentes ...
  
  // Adicionado para multi-tenancy
  companyId         String?  // NULL para dados globais (compatibilidade)
  
  // Relacionamento
  company           Company?  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  @@index([companyId])
  @@index([channel, companyId])
}

// Estender modelo Campaign existente
model Campaign {
  // ... campos existentes ...
  
  // Herdado de AdAccount, mas pode estar aqui também
  companyId         String?
  company           Company?  @relation(fields: [companyId], references: [id], onDelete: SetNull)
  
  // Adicionado: soft link com Lead
  leads             Lead[]    @relation("CampaignToLead")
  
  @@index([companyId])
}

// Estender modelo ConversionEvent existente
model ConversionEvent {
  // ... campos existentes ...
  
  // Adicionado para multi-tenancy
  companyId         String
  company           Company   @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  // Adicionado: link com Lead
  leadId            String?
  lead              Lead?     @relation(fields: [leadId], references: [id], onDelete: SetNull)
  
  // Adicionado: origem detalhada
  utm_source        String?
  utm_medium        String?
  utm_campaign      String?
  utm_term          String?
  utm_content       String?
  
  device            String?   // mobile, desktop, tablet
  browser           String?
  os                String?
  
  // Indexação melhorada
  @@index([companyId])
  @@index([leadId])
  @@index([companyId, createdAt])
  @@index([companyId, channel])
}
```

---

## 📋 BLOCO 2: CRM - LEADS & PIPELINE

```prisma
// Lead - O coração do CRM
model Lead {
  id                String    @id @default(cuid())
  
  companyId         String
  
  // Identificação
  name              String
  email             String?
  phone             String?
  whatsapp          String?
  
  // Origem
  source            String    @default("organic")  // meta, google, tiktok, shopee, whatsapp, indicacao, organico, site, landing
  campaign          String?   // Nome da campanha
  adSet             String?
  ad                String?
  keyword           String?   // Para Google Ads
  
  // Localização
  city              String?
  state             String?
  country           String?   @default("BR")
  
  // Interesse
  productInterest   String?   // Produto ou serviço de interesse
  estimatedValue    Decimal?  @db.Decimal(12, 2)
  
  // Relacionamentos
  campaignId        String?   // Link com Campaign
  campaign          Campaign? @relation("CampaignToLead", fields: [campaignId], references: [id], onDelete: SetNull)
  
  // Pipeline CRM
  pipelineId        String
  stageId           String
  pipeline          CRMPipeline @relation(fields: [pipelineId], references: [id], onDelete: Restrict)
  stage             CRMStage    @relation(fields: [stageId], references: [id], onDelete: Restrict)
  
  // Vendedor responsável
  vendorId          String?
  vendor            CompanyUser? @relation(fields: [vendorId], references: [id], onDelete: SetNull)
  
  // Rastreamento
  conversions       ConversionEvent[]
  whatsappConversations WhatsAppConversation[]
  notes             LeadNote[]
  activities        LeadActivity[]
  
  // Meta
  valueInvested     Decimal?  @db.Decimal(12, 2)  // Valor investido em ads
  notes_internal    String?
  tagsJson          String?   // JSON array de tags
  customFields      Json?     // Campos customizados por empresa
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  lastInteractionAt DateTime?
  closedAt          DateTime?
  
  // Índices
  company           Company   @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  @@unique([companyId, email, phone]) // Não duplicar leads por empresa
  @@index([companyId])
  @@index([pipelineId])
  @@index([stageId])
  @@index([source])
  @@index([campaign])
  @@index([vendorId])
  @@index([createdAt])
  @@index([lastInteractionAt])
}

// Nota do Lead
model LeadNote {
  id                String    @id @default(cuid())
  
  leadId            String
  companyUserId     String?
  
  content           String    @db.Text
  isInternal        Boolean   @default(true)
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relacionamentos
  lead              Lead      @relation(fields: [leadId], references: [id], onDelete: Cascade)
  author            CompanyUser? @relation(fields: [companyUserId], references: [id], onDelete: SetNull)
  
  @@index([leadId])
  @@index([companyUserId])
}

// Atividade do Lead - Histórico
model LeadActivity {
  id                String    @id @default(cuid())
  
  leadId            String
  
  type              String    // stage_changed, note_added, sale_created, whatsapp_received, email_sent, etc
  title             String
  description       String?   @db.Text
  
  metadata          Json?     // Dados específicos da atividade
  
  createdAt         DateTime  @default(now())
  
  // Relacionamentos
  lead              Lead      @relation(fields: [leadId], references: [id], onDelete: Cascade)
  
  @@index([leadId])
  @@index([type])
  @@index([createdAt])
}

// Pipeline CRM - Customizável por empresa
model CRMPipeline {
  id                String    @id @default(cuid())
  
  companyId         String
  name              String
  description       String?
  isDefault         Boolean   @default(false)
  isActive          Boolean   @default(true)
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relacionamentos
  company           Company   @relation(fields: [companyId], references: [id], onDelete: Cascade)
  stages            CRMStage[]
  leads             Lead[]
  
  @@unique([companyId, name])
  @@index([companyId])
}

// Estágio do Pipeline - Customizável
model CRMStage {
  id                String    @id @default(cuid())
  
  pipelineId        String
  name              String
  description       String?
  order             Int       @default(0)
  color             String?   @default("#3b82f6")
  isFinal           Boolean   @default(false)  // Estágio final (ganho/perdido)?
  isWon             Boolean?  // true = ganho, false = perdido, null = aberto
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relacionamentos
  pipeline          CRMPipeline @relation(fields: [pipelineId], references: [id], onDelete: Cascade)
  leads             Lead[]
  
  @@unique([pipelineId, name])
  @@index([pipelineId])
}
```

---

## 💬 BLOCO 3: WHATSAPP

```prisma
// Conversa WhatsApp
model WhatsAppConversation {
  id                String    @id @default(cuid())
  
  companyId         String
  leadId            String?
  
  phoneNumber       String    // Número do cliente
  status            String    @default("open")  // open, closed, archived
  
  // Vendedor responsável
  vendorId          String?
  
  // Rastreamento
  lastMessageAt     DateTime?
  averageResponseTime Int?    // Em segundos
  
  // Meta
  notes             String?   @db.Text
  customFields      Json?
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relacionamentos
  company           Company   @relation(fields: [companyId], references: [id], onDelete: Cascade)
  lead              Lead?     @relation(fields: [leadId], references: [id], onDelete: SetNull)
  vendor            CompanyUser? @relation(fields: [vendorId], references: [id], onDelete: SetNull)
  messages          WhatsAppMessage[]
  aiAnalyses        AIAnalysis[]
  
  @@unique([companyId, phoneNumber])
  @@index([companyId])
  @@index([leadId])
  @@index([vendorId])
  @@index([status])
  @@index([lastMessageAt])
}

// Mensagem WhatsApp
model WhatsAppMessage {
  id                String    @id @default(cuid())
  
  conversationId    String
  
  role              String    // user, assistant, system
  content           String    @db.Text
  
  // Metadados da mensagem
  externalId        String?   // ID externo (de Meta/WhatsApp)
  type              String?   // text, image, document, etc
  mediaUrl          String?
  
  // IA Analysis
  sentiment         String?   // positive, neutral, negative
  hasObjection      Boolean?
  
  createdAt         DateTime  @default(now())
  
  // Relacionamentos
  conversation      WhatsAppConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  
  @@index([conversationId])
  @@index([role])
  @@index([createdAt])
}

// Análise de IA - Pode ser sobre conversa ou mensagem individual
model AIAnalysis {
  id                String    @id @default(cuid())
  
  conversationId    String?
  leadId            String?
  
  type              String    // message_sentiment, conversation_summary, objection_detection, purchase_likelihood, recommendation
  
  // Resultado da análise
  result            Json      // Dados estruturados da análise
  confidence        Float?    // 0.0 a 1.0
  
  // Contexto
  model             String?   // claude-opus-4, etc
  tokensUsed        Int?
  
  createdAt         DateTime  @default(now())
  
  // Relacionamentos
  conversation      WhatsAppConversation? @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  lead              Lead?     @relation(fields: [leadId], references: [id], onDelete: Cascade)
  
  @@index([conversationId])
  @@index([leadId])
  @@index([type])
}
```

---

## 💰 BLOCO 4: FINANCEIRO

```prisma
// Venda - Versão expandida
model Sale {
  id                String    @id @default(cuid())
  
  companyId         String
  leadId            String?
  
  // Valor
  amount            Decimal   @db.Decimal(12, 2)
  profit            Decimal?  @db.Decimal(12, 2)  // Lucro
  commission        Decimal?  @db.Decimal(12, 2)  // Comissão
  
  // Origem
  source            String    // meta, google, tiktok, shopee, whatsapp, direto, etc
  campaignId        String?   // Qual campanha/anúncio gerou
  campaign          Campaign? @relation(fields: [campaignId], references: [id], onDelete: SetNull)
  
  // Pagamento
  paymentMethod     String?   // credit_card, pix, transfer, cash, etc
  paymentStatus     String    @default("pending") // pending, completed, failed, refunded
  
  // Produto/Serviço
  productName       String?
  quantity          Int?      @default(1)
  
  // Vendedor
  vendorId          String?
  vendor            CompanyUser? @relation(fields: [vendorId], references: [id], onDelete: SetNull)
  
  // Meta
  notes             String?
  customFields      Json?
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  completedAt       DateTime?
  
  // Relacionamentos
  company           Company   @relation(fields: [companyId], references: [id], onDelete: Cascade)
  lead              Lead?     @relation(fields: [leadId], references: [id], onDelete: SetNull)
  
  @@index([companyId])
  @@index([leadId])
  @@index([source])
  @@index([paymentStatus])
  @@index([vendorId])
  @@index([createdAt])
}
```

---

## 🔌 BLOCO 5: INTEGRAÇÕES

```prisma
// Integração de Empresa
model CompanyIntegration {
  id                String    @id @default(cuid())
  
  companyId         String
  
  type              String    // meta, google, tiktok, shopee, whatsapp, analytics, etc
  name              String    // Nome amigável
  status            String    @default("disconnected") // connected, disconnected, error, testing
  
  // Credenciais (criptografadas em produção)
  accessToken       String?   @db.Text
  refreshToken      String?   @db.Text
  webhookSecret     String?
  
  // Configuração
  config            Json?     // Configurações específicas de cada integração
  
  // Rastreamento
  lastSyncAt        DateTime?
  lastErrorAt       DateTime?
  lastError         String?
  
  // Meta
  testedAt          DateTime?
  connectedAt       DateTime?
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relacionamentos
  company           Company   @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  @@unique([companyId, type])
  @@index([companyId])
  @@index([status])
  @@index([lastSyncAt])
}
```

---

## 📊 BLOCO 6: RELATÓRIOS

```prisma
// Relatório
model Report {
  id                String    @id @default(cuid())
  
  companyId         String
  
  type              String    // daily, weekly, monthly, custom
  name              String
  description       String?
  
  // Período
  startDate         DateTime
  endDate           DateTime
  
  // Conteúdo
  data              Json      // Dados do relatório
  metrics           Json?     // Métricas agregadas
  
  // Status
  status            String    @default("generated") // generated, pending, error
  
  // Criado por
  createdByUserId   String?
  
  createdAt         DateTime  @default(now())
  
  // Relacionamentos
  company           Company   @relation(fields: [companyId], references: [id], onDelete: Cascade)
  createdByUser     User?     @relation(fields: [createdByUserId], references: [id], onDelete: SetNull)
  
  @@index([companyId])
  @@index([type])
}
```

---

## 📝 BLOCO 7: AUDITORIA

```prisma
// Log de Auditoria
model AuditLog {
  id                String    @id @default(cuid())
  
  companyId         String
  userId            String?
  companyUserId     String?
  
  // Ação
  action            String    // create, update, delete, view, export, etc
  resource          String    // Lead, Sale, Integration, etc
  resourceId        String?   // ID do recurso afetado
  
  // Detalhes
  changes           Json?     // O que foi alterado (old -> new)
  description       String?
  
  // IP e User Agent
  ipAddress         String?
  userAgent         String?
  
  createdAt         DateTime  @default(now())
  
  // Relacionamentos
  company           Company   @relation(fields: [companyId], references: [id], onDelete: Cascade)
  user              User?     @relation(fields: [userId], references: [id], onDelete: SetNull)
  companyUser       CompanyUser? @relation(fields: [companyUserId], references: [id], onDelete: SetNull)
  
  @@index([companyId])
  @@index([action])
  @@index([resource])
  @@index([createdAt])
}
```

---

## 📋 RESUMO DE ALTERAÇÕES

### Novos Modelos (11)
1. Company
2. CompanyUser
3. Permission
4. CompanyUserPermission
5. Lead
6. LeadNote
7. LeadActivity
8. CRMPipeline
9. CRMStage
10. WhatsAppConversation
11. WhatsAppMessage
12. AIAnalysis
13. CompanyIntegration
14. Report
15. AuditLog

### Modelos Estendidos (5)
1. User → adicionar companyUsers, defaultCompanyId
2. AdAccount → adicionar companyId
3. Campaign → adicionar companyId, leads
4. ConversionEvent → adicionar companyId, leadId, utm_*, device, browser, os
5. Sale → (expandir existente com lucro, comissão)

### Modelos Intactos
- Account (OAuth)
- Session (JWT)
- MetricSnapshot
- Alert

---

## 🔒 Segurança

### Encriptação
- `accessToken` em `CompanyIntegration` deve ser encriptado
- Credenciais nunca devem ser logadas
- Usar variáveis de ambiente para chaves de encriptação

### Permissões
- Cada query deve filtrar por `companyId`
- Middleware deve validar acesso à empresa
- Audit log para ações sensíveis

### Índices
- Todos os campos de filtro têm índices
- Queries por `companyId` são rápidas
- Soft deletes não implementados (usar IsDeleted se necessário)

---

## 🚀 Próximos Passos

1. Criar migrations Prisma
2. Implementar auth middleware
3. Ajustar ADAccounts, Campaign, ConversionEvent para multi-tenancy
4. Criar endpoints /api/v1/*
5. Criar páginas de gerenciamento de empresa
6. Implementar permissões
