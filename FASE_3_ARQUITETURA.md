# 🤖 FASE 3 - WHATSAPP + IA (Arquitetura)

**Duração estimada:** 2-3 semanas  
**Complexidade:** 🔴 Alta  
**Integrações:** WhatsApp Cloud API + Claude AI

---

## 🎯 OBJETIVO

Integrar WhatsApp Business com IA para:
1. **Sincronizar** mensagens em tempo real
2. **Analisar** automaticamente cada conversa
3. **Prever** probabilidade de compra
4. **Detectar** objeções e sentimentos
5. **Recomendar** próximas ações
6. **Categorizar** leads automaticamente

---

## 🏗️ ARQUITETURA GERAL

```
┌─────────────────┐
│  WhatsApp User  │  (Cliente da empresa)
└────────┬────────┘
         │ (Mensagem)
         ↓
┌─────────────────────────────────┐
│   WhatsApp Cloud API            │  (Meta)
│   (Business Account)            │
└────────┬────────────────────────┘
         │ (Webhook)
         ↓
┌─────────────────────────────────┐
│  POST /api/webhooks/whatsapp    │  (Nosso backend)
│  ├─ Salvar mensagem             │
│  ├─ Criar/atualizar lead        │
│  └─ Enfileirar para IA          │
└────────┬────────────────────────┘
         │
         ↓
┌─────────────────────────────────┐
│  Background Job (Bull Queue)    │
│  ├─ Buscar contexto conversa    │
│  ├─ Chamar Claude API           │
│  └─ Salvar análise              │
└────────┬────────────────────────┘
         │
         ↓
┌─────────────────────────────────┐
│  Dashboard CRM (Real-time)      │
│  ├─ Conversa sincronizada       │
│  ├─ Análise de IA               │
│  └─ Ações recomendadas          │
└─────────────────────────────────┘
```

---

## 📱 FLUXO DE UMA MENSAGEM

### 1️⃣ **Usuário envia mensagem no WhatsApp**
```
Cliente → WhatsApp → Meta Cloud API
```

### 2️⃣ **Webhook recebe notificação**
```
Meta → POST /api/webhooks/whatsapp
{
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "from": "5511999999999",
          "text": "Olá, quero saber mais sobre vocês",
          "id": "wamid.xxx",
          "timestamp": 1234567890
        }]
      }
    }]
  }]
}
```

### 3️⃣ **Backend salva no DB**
```
CREATE WhatsAppMessage {
  conversationId: "xxx",
  role: "user",
  content: "Olá, quero saber mais sobre vocês",
  externalId: "wamid.xxx",
  type: "text",
  createdAt: now()
}
```

### 4️⃣ **Criar/atualizar Lead**
```
FIND OR CREATE Lead {
  companyId: "empresa123",
  phoneNumber: "5511999999999",
  source: "whatsapp",
  lastMessageAt: now()
}
```

### 5️⃣ **Enfileirar para IA**
```
QUEUE.add({
  conversationId: "xxx",
  leadId: "lead123",
  type: "analyze_message"
})
```

### 6️⃣ **IA analisa (Background Job)**
```
// Buscar últimas 10 mensagens
messages = DB.query(conversationId)

// Prompt customizado
prompt = `
Analise esta conversa de WhatsApp:
${messages.map(m => `${m.role}: ${m.content}`).join('\n')}

Retorne em JSON:
{
  "sentiment": "positive|neutral|negative",
  "hasObjection": boolean,
  "purchaseLikelihood": 0-100,
  "suggestedResponse": "...",
  "nextAction": "send_offer|more_info|callback|wait",
  "summary": "resumo curto",
  "keywords": ["palavra1", "palavra2"]
}
`

// Chamar Claude
response = await claude.messages.create({
  model: "claude-opus-4-8",
  messages: [{ role: "user", content: prompt }]
})

// Salvar resultado
CREATE AIAnalysis {
  conversationId: "xxx",
  leadId: "lead123",
  type: "message_sentiment",
  result: JSON.parse(response),
  confidence: 0.95
}
```

### 7️⃣ **Dashboard exibe em tempo real**
```
Conversa sincronizada + Análise IA
├─ Sentimento: 😊 Positivo
├─ Probabilidade de compra: 75%
├─ Objeções detectadas: Nenhuma
├─ Próxima ação: Enviar orçamento
└─ Resumo: Cliente interessado em produto X
```

---

## 🔗 INTEGRAÇÕES NECESSÁRIAS

### 1. WhatsApp Cloud API (Meta)
- **O que é:** API oficial do WhatsApp Business
- **Como funciona:** Webhooks + REST API
- **Setup:**
  1. Criar app no Meta Developers
  2. Obter phone number ID
  3. Gerar access token
  4. Configurar webhook URL
  5. Validar token de verificação

- **O que pode fazer:**
  - Receber mensagens (webhook)
  - Enviar mensagens (API)
  - Obter histórico (API)
  - Marcar como lido (API)

### 2. Claude AI API (Anthropic)
- **O que é:** API de IA para análise
- **Como funciona:** REST API com streaming
- **Setup:**
  1. Obter API key
  2. Criar prompts customizados
  3. Definir temperatura e max_tokens

- **O que pode fazer:**
  - Análise de sentimento
  - Detecção de objeções
  - Sugestão de resposta
  - Categorização de lead
  - Resumo da conversa

---

## 📊 MODELOS DO BANCO

### WhatsAppConversation (já existe)
```typescript
{
  id: string
  companyId: string
  phoneNumber: string
  status: "open" | "closed" | "archived"
  lastMessageAt: DateTime
  averageResponseTime: number (segundos)
  notes: string
  createdAt: DateTime
  updatedAt: DateTime
  
  messages: WhatsAppMessage[]
}
```

### WhatsAppMessage (já existe)
```typescript
{
  id: string
  conversationId: string
  role: "user" | "assistant" | "system"
  content: string
  externalId: string (ID do WhatsApp)
  type: "text" | "image" | "document"
  mediaUrl: string
  sentiment: "positive" | "neutral" | "negative"
  hasObjection: boolean
  createdAt: DateTime
}
```

### AIAnalysis (já existe)
```typescript
{
  id: string
  conversationId: string
  leadId: string
  type: "message_sentiment" | "conversation_summary" | "objection_detection" | "purchase_likelihood" | "recommendation"
  result: JSON {
    sentiment: string
    purchaseLikelihood: number
    hasObjection: boolean
    suggestedResponse: string
    nextAction: string
    summary: string
    keywords: string[]
  }
  confidence: number (0-1)
  model: string ("claude-opus-4-8")
  tokensUsed: number
  createdAt: DateTime
}
```

---

## 🔄 ENDPOINTS DA FASE 3

### WhatsApp Integration
```typescript
// Configuração
POST   /api/v1/companies/:id/integrations/whatsapp/connect
       ├─ phone_number_id
       ├─ business_account_id
       └─ access_token

GET    /api/v1/companies/:id/integrations/whatsapp/status
       └─ Verificar conexão

// Conversas
GET    /api/v1/companies/:id/whatsapp/conversations
       ├─ Listar conversas
       ├─ Filtros: status, leadId, search
       └─ Paginação

GET    /api/v1/companies/:id/whatsapp/:conversationId
       ├─ Detalhe da conversa
       ├─ Histórico completo
       └─ Análises de IA

POST   /api/v1/companies/:id/whatsapp/:conversationId/send
       ├─ Enviar mensagem
       └─ message: string

// Webhooks
POST   /api/webhooks/whatsapp
       ├─ Receber mensagens
       ├─ Validar token
       └─ Enfileirar para IA

// IA
GET    /api/v1/companies/:id/whatsapp/:conversationId/analysis
       ├─ Análise completa
       ├─ Sentimento
       ├─ Probabilidade
       └─ Recomendações

POST   /api/v1/companies/:id/whatsapp/:conversationId/reanalyze
       └─ Forçar reanalise com IA
```

---

## 💬 EXEMPLO DE IA EM AÇÃO

### Conversa Original
```
Cliente: Olá, tudo bem? Queria saber sobre o produto X
Empresa: Olá! Tudo bem sim! Como podemos ajudar?
Cliente: Qual o preço? É muito caro?
Empresa: Depende do seu orçamento. Qual seria?
Cliente: Acho que achei caro mesmo... E com desconto?
```

### Análise da IA
```json
{
  "sentiment": "neutral",
  "purchaseLikelihood": 45,
  "hasObjection": true,
  "objections": ["price_concern"],
  "suggestedResponse": "Temos opções de parcelamento e descontos para grandes volumes!",
  "nextAction": "send_offer",
  "summary": "Cliente interessado mas preocupado com preço. Tem margem de negociação.",
  "keywords": ["preço", "desconto", "caro"],
  "sentiment_breakdown": {
    "message_1": "positive",
    "message_3": "negative",
    "message_5": "neutral"
  }
}
```

### Dashboard Exibe
```
📞 Conversa #123
├─ Cliente: 5511999999999
├─ Empresa: Fabrica XYZ
├─ 🟡 Sentimento: Neutro (oscilando)
├─ 📊 Probabilidade de compra: 45%
├─ ⚠️ Objeção detectada: Preço
├─ 💡 Sugestão: Enviar proposta com desconto
├─ 📝 Resumo: Interessado mas preocupado com preço
└─ 🎯 Próxima ação: send_offer
```

---

## 🔒 SEGURANÇA DO WHATSAPP

### Validação de Webhook
```typescript
// Meta envia: X-Hub-Signature-256: sha256=xxxxx
// Nós validamos:

const crypto = require('crypto');

function validateWebhook(req, secret) {
  const signature = req.headers['x-hub-signature-256'];
  const payload = req.body; // raw body
  
  const hash = 'sha256=' + 
    crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
  
  return hash === signature;
}
```

### Encriptação de Tokens
```typescript
// Nunca salvar token em plaintext!
// Usar process.env ou vault externo

accessToken = await encrypt(
  request.body.access_token,
  encryptionKey
);

await prisma.companyIntegration.update({
  where: { companyId_type: { companyId, type: 'whatsapp' } },
  data: {
    accessToken: encrypted,
    status: 'connected',
    connectedAt: new Date()
  }
});
```

---

## 📈 FLUXO COMPLETO (VISÃO EXECUTIVA)

```
1. Cliente envia mensagem no WhatsApp
                ↓
2. Meta notifica nosso webhook
                ↓
3. Salvamos mensagem no DB
                ↓
4. Criamos/atualizamos lead
                ↓
5. Enfileiramos para análise de IA
                ↓
6. IA analisa conversa (contexto + última mensagem)
                ↓
7. IA retorna: sentimento, probabilidade, objeção, recomendação
                ↓
8. Dashboard exibe análise em tempo real
                ↓
9. Vendedor vê: "Cliente está 75% propenso a comprar, objeção é preço"
                ↓
10. Vendedor envia resposta recomendada ou customizada
```

---

## 🚀 PRÓXIMOS PASSOS (FASE 3)

### Semana 1
- [ ] Setup Meta Developers Console
- [ ] Criar WhatsApp Business Account
- [ ] Obter phone number + access token
- [ ] Implementar webhook validation
- [ ] Testes de recebimento

### Semana 2
- [ ] Implementar endpoints de conversa
- [ ] Sincronizar histórico de mensagens
- [ ] Integrar com Lead (criar/atualizar)
- [ ] Página de conversas
- [ ] Testes de sincronização

### Semana 3
- [ ] Integrar Claude AI
- [ ] Criar prompts de análise
- [ ] Implementar background jobs (Bull)
- [ ] Página de análise
- [ ] Testes E2E

---

## 📚 DOCUMENTAÇÃO EXTERNA

- [WhatsApp Cloud API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Claude API Docs](https://docs.anthropic.com/)
- [Webhooks Best Practices](https://docs.anthropic.com/)

---

## 💡 DIFERENCIAIS

### Por que é poderoso:
1. **Análise automática** - IA vê padrões que humanos perdem
2. **Tempo real** - Análise enquanto cliente conversa
3. **Escalável** - Mesmo sistema para 1.000+ empresas
4. **Customizável** - Cada empresa seus próprios prompts
5. **Integrado** - Funciona com CRM, atualiza lead score

### Por que é único:
- Combina WhatsApp oficial com Claude
- Análise de sentimento + detecção de objeção
- Recomendação de próxima ação automática
- Integração completa com CRM
- Multi-tenant desde o início

---

**Fase 3 será o "diferencial" da plataforma! 🚀**

Quer que eu comece a implementação agora ou quer revisar algo antes?
