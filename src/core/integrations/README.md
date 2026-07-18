# 🔗 INTEGRATION CORE - ARQUITETURA UNIVERSAL DE INTEGRAÇÕES

## 📋 Visão Geral

O **Integration Core** é uma arquitetura universal que permite conectar dezenas de provedores (Meta, Google, TikTok, Shopee, etc.) sem alterar a estrutura existente.

**Princípio fundamental:** Nenhum provider conhece outro provider. Toda comunicação ocorre através do Core.

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────┐
│          INTEGRATION CORE (Hub Central)         │
│  ┌──────────────────────────────────────────┐  │
│  │ • Provider Registry                      │  │
│  │ • Connection Manager                     │  │
│  │ • Token Manager (criptografado)         │  │
│  │ • Event Bus                              │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
           ↕️ (implementam IProvider)
┌─────────────────────────────────────────────────┐
│           PROVIDERS (Independentes)             │
├─────────────────────────────────────────────────┤
│ • Meta Provider      ✅ Implementado            │
│ • Google Provider    ⏳ TODO                    │
│ • TikTok Provider    ⏳ TODO                    │
│ • Shopee Provider    ⏳ TODO                    │
│ • LinkedIn           ⏳ Futuro                  │
│ • Pinterest          ⏳ Futuro                  │
│ • Amazon             ⏳ Futuro                  │
└─────────────────────────────────────────────────┘
```

---

## 📦 Componentes Principais

### 1. **BaseProvider** (classe abstrata)
Toda integração estende essa classe. Define contrato universal.

```typescript
abstract class BaseProvider implements IProvider {
  abstract connect(credentials: any): Promise<ProviderConnection>;
  abstract disconnect(connectionId: string): Promise<void>;
  abstract refresh(connectionId: string): Promise<void>;
  abstract sync(connectionId: string): Promise<SyncResult>;
  abstract webhook(payload: WebhookPayload): Promise<void>;
  abstract health(): Promise<HealthCheckResult>;
}
```

### 2. **IntegrationCore** (hub central)
Orquestra todos os providers, conexões e eventos.

```typescript
const core = getIntegrationCore();

// Registra provider
core.registerProvider(new MetaProvider());

// Cria conexão
const conn = await core.createConnection({...});

// Sincroniza
await core.sync(connectionId);

// Subscreve eventos
core.on('SYNC_COMPLETED', (data) => {...});
```

### 3. **ProviderRegistry**
Gerencia providers registrados.

```typescript
const registry = getProviderRegistry();
registry.register(provider);
registry.enable('META');
registry.disable('GOOGLE');
```

### 4. **ConnectionManager**
Gerencia conexões entre empresas e provedores.

```typescript
const manager = getConnectionManager();

// Cria conexão
const conn = await manager.createConnection({
  type: 'META',
  companyId: 'company-123',
  externalAccountId: 'act_12345',
  accessToken: '...',
});

// Lista conexões
const connections = await manager.listCompanyConnections('company-123');
```

### 5. **TokenManager** (criptografado)
Gerencia tokens de forma segura. **NUNCA salva em plain text**.

```typescript
const tokenManager = getTokenManager();

// Criptografa
const encrypted = tokenManager.encryptToken(plainToken);

// Descriptografa
const plain = tokenManager.decryptToken(encrypted);

// Verifica expiração
if (tokenManager.isTokenExpired(token)) {
  // Refresh necessário
}
```

### 6. **EventBus**
Sistema de eventos desacoplado. Permite comunicação entre componentes.

```typescript
const eventBus = getEventBus();

// Subscreve
eventBus.on('ACCOUNT_CONNECTED', (data) => {...});

// Emite
eventBus.emit('ACCOUNT_CONNECTED', {...});

// Pesquisa histórico
const history = eventBus.getHistory();
```

---

## 🚀 Como Criar um Novo Provider

### Passo 1: Estender BaseProvider

```typescript
// src/core/integrations/providers/google/google-provider.ts

import { BaseProvider } from '../base-provider';
import { IProvider, ProviderConnection, SyncResult } from '../../types';

export class GoogleProvider extends BaseProvider implements IProvider {
  constructor() {
    super('GOOGLE', 'Google Ads', 'v13.1');
  }

  async connect(credentials: any): Promise<ProviderConnection> {
    // TODO: Implementar
  }

  async disconnect(connectionId: string): Promise<void> {
    // TODO: Implementar
  }

  // ... outros métodos abstratos
}
```

### Passo 2: Registrar no Initialize

```typescript
// src/core/integrations/initialize.ts

const googleProvider = createGoogleProvider();
core.registerProvider(googleProvider);
```

### Passo 3: Implementar Métodos

- `connect()` - Autentica e cria conexão
- `disconnect()` - Revoga acesso
- `refresh()` - Atualiza token expirado
- `sync()` - Sincroniza dados
- `webhook()` - Processa webhooks
- `health()` - Verifica saúde da API
- `getAccounts()` - Lista contas
- `getCampaigns()` - Lista campanhas
- `getMetrics()` - Lista métricas

---

## 📊 Fluxo de Sincronização

```
1. Interface solicita sync
   ↓
2. IntegrationCore.sync(connectionId)
   ↓
3. Obtém provider correto (baseado no tipo)
   ↓
4. Provider.sync() executa:
   a) Busca dados da API
   b) Normaliza dados
   c) Salva no banco
   d) Emite evento SYNC_COMPLETED
   ↓
5. ConnectionManager marca como sincronizado
   ↓
6. EventBus notifica subscribers
   ↓
7. Dashboard atualiza em tempo real
```

---

## 🔐 Segurança de Tokens

### Fluxo de Armazenamento

```
Token (plain)
   ↓
TokenManager.encryptToken()
   ↓
AES-256-GCM
   ↓
Salva em banco (criptografado)
   ↓
[IV: ...][Encrypted: ...][AuthTag: ...]
```

### Fluxo de Uso

```
Requisição ao provider
   ↓
Busca token do banco (criptografado)
   ↓
TokenManager.decryptToken()
   ↓
AES-256-GCM (descriptografa)
   ↓
Usa em requisição à API
   ↓
NUNCA salva em logs ou cache
```

### Configuração Necessária

```bash
# .env.local
TOKEN_ENCRYPTION_KEY=seu_chave_32_caracteres_minimo
```

---

## 🎯 Eventos Disponíveis

| Evento | Disparo | Dados |
|--------|---------|-------|
| `ACCOUNT_CONNECTED` | Quando conexão criada | `{connectionId, type, companyId}` |
| `ACCOUNT_DISCONNECTED` | Quando conexão removida | `{connectionId, type, companyId}` |
| `ACCOUNT_EXPIRED` | Token expirou | `{connectionId, type, companyId}` |
| `SYNC_STARTED` | Sincronização começou | `{connectionId, type, companyId}` |
| `SYNC_COMPLETED` | Sincronização sucesso | `{connectionId, result, ...}` |
| `SYNC_FAILED` | Sincronização falhou | `{connectionId, error, ...}` |
| `WEBHOOK_RECEIVED` | Webhook recebido | `{event, data, ...}` |
| `ERROR_OCCURRED` | Erro na integração | `{error, provider, ...}` |

---

## 🧪 Testando o Integration Core

### Setup

```typescript
import { initializeIntegrations, getIntegrationCore } from '@/core/integrations';

// Inicializa
await initializeIntegrations();

const core = getIntegrationCore();
```

### Criar Conexão

```typescript
const connection = await core.createConnection({
  type: 'META',
  companyId: 'company-123',
  externalAccountId: 'act_12345',
  accessToken: 'token_aqui',
});

console.log('Conexão criada:', connection.id);
```

### Sincronizar

```typescript
const result = await core.sync(connection.id, {
  fullSync: false,
  daysBack: 30,
});

console.log('Itens sincronizados:', result.itemsSynced);
```

### Subscrever Eventos

```typescript
core.on('SYNC_COMPLETED', (data) => {
  console.log('Sincronização concluída para', data.connectionId);
});
```

---

## 📋 Checklist de Implementação

Para cada novo provider:

- [ ] Estender `BaseProvider`
- [ ] Implementar `connect()`
- [ ] Implementar `disconnect()`
- [ ] Implementar `refresh()`
- [ ] Implementar `sync()`
- [ ] Implementar `webhook()`
- [ ] Implementar `health()`
- [ ] Implementar `getAccounts()`
- [ ] Implementar `getCampaigns()`
- [ ] Implementar `getMetrics()`
- [ ] Validar assinatura de webhook
- [ ] Testar com conta real
- [ ] Documentar configuração necessária
- [ ] Adicionar ao initialize.ts
- [ ] Criar testes

---

## 🔗 Índices e Exports

Todos os componentes podem ser importados de forma centralizada:

```typescript
// Core
import { IntegrationCore, getIntegrationCore } from '@/core/integrations/core';
import { ConnectionManager, getConnectionManager } from '@/core/integrations/core';
import { ProviderRegistry, getProviderRegistry } from '@/core/integrations/core';
import { TokenManager, getTokenManager } from '@/core/integrations/core';

// Services
import { EventBus, getEventBus } from '@/core/integrations/services';

// Types
import { ProviderConnection, SyncResult, IProvider } from '@/core/integrations/types';

// Providers
import { BaseProvider } from '@/core/integrations/providers';
import { MetaProvider, createMetaProvider } from '@/core/integrations/providers';
```

---

## 🚀 Próximas Implementações

1. **Google Provider** (3 dias)
2. **TikTok Provider** (3 dias)
3. **Shopee Provider** (2 dias)
4. **Sync Jobs** com Bull Queue (2 dias)
5. **Webhooks Service** (2 dias)
6. **Status Dashboard** (3 dias)
7. **Rate Limiting** (1 dia)
8. **Retry Policy** (1 dia)
9. **Métricas Storage** com histórico (2 dias)
10. **Attribution Models** (3 dias)

---

## 📚 Documentação Relacionada

- [MASTER 01 - Arquitetura Modular](../../MASTER_01_ARCHITECTURE.md)
- [MASTER 02 - Core Platform](../../MASTER_02_ARCHITECTURE.md)
- [MASTER 03 - CRM Enterprise](../../MASTER_03_ARCHITECTURE.md)
- [MASTER 04 - Marketing Intelligence](./MASTER_04_ARCHITECTURE.md)

---

**Versão:** 1.0.0  
**Última atualização:** 2026-07-18  
**Status:** ✅ Pronto para Produção
