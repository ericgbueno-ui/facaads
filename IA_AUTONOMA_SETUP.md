# 🤖 Setup: IA Autônoma para Leads

**Status:** ✅ Fase 3 Implementada  
**Data:** 2026-07-18  
**Versão:** 1.0

---

## 🎯 O Que Foi Implementado

### Serviços Criados

1. **Web Scraper** (`src/lib/ai-leads/scraper.ts`)
   - Extrai conteúdo do website
   - Identifica produtos e serviços
   - Coleta informações de contato
   - Extrai horários de funcionamento

2. **Response Generator** (`src/lib/ai-leads/response-generator.ts`)
   - Integração com Claude AI
   - Análise de leads com contexto da empresa
   - Classificação de ações (responder, redirecionar, atribuir humano)
   - Score de qualificação 0-100

3. **Lead Intake Webhook** (`src/app/api/webhooks/lead-intake/route.ts`)
   - Recebe leads de múltiplas fontes
   - Google Forms, Instagram, Website, Email, WhatsApp
   - Processa automaticamente com IA
   - Salva no CRM

4. **Knowledge Base API** (`src/app/api/v1/companies/[id]/knowledge/route.ts`)
   - GET: Obter conhecimento armazenado
   - PUT: Atualizar conhecimento manualmente
   - POST (scrape-website): Fazer scrape automático

5. **Dashboard UI** (`src/app/companies/[id]/ai-leads/page.tsx`)
   - Interface para gerenciar conhecimento
   - Botão de scraping de website
   - Visualização de produtos/serviços
   - Histórico de interações

---

## 📋 SETUP COMPLETO

### 1. Fazer Migrações do Banco de Dados

```bash
# As tabelas companyKnowledge e leadInteraction já existem no schema
# Se não fez ainda:
npx prisma migrate dev --name "add_ai_leads_tables"
```

### 2. Instalar Dependência de Scraping

```bash
npm install cheerio
```

### 3. Configurar Variáveis de Ambiente

Adicionar ao `.env.local`:

```env
# Já deve ter:
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=postgresql://...

# Nenhuma nova variável necessária!
# Claude API já está configurada
```

### 4. Testar Endpoints

#### A. Verificar Health Check do Webhook

```bash
curl http://localhost:3000/api/webhooks/lead-intake
# Resposta: { "status": "ok", "endpoint": "/api/webhooks/lead-intake", "methods": ["POST"] }
```

#### B. Testar Lead Intake (Manual)

```bash
curl -X POST http://localhost:3000/api/webhooks/lead-intake \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "SEU_COMPANY_ID",
    "name": "João Silva",
    "email": "joao@email.com",
    "phone": "+5511999999999",
    "message": "Qual o preço do produto X?",
    "source": "website"
  }'

# Resposta esperada:
{
  "success": true,
  "leadId": "lead_123",
  "aiResponse": {
    "message": "Oi João! Ótima pergunta...",
    "action": "redirect_whatsapp",
    "qualification": 75,
    "confidence": 0.92
  }
}
```

#### C. Scraping de Website

```bash
curl -X POST http://localhost:3000/api/v1/companies/SEU_COMPANY_ID/knowledge/scrape-website \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "websiteUrl": "https://seusite.com.br"
  }'

# Resposta esperada:
{
  "success": true,
  "knowledge": {
    "id": "know_123",
    "websiteUrl": "https://seusite.com.br",
    "products": ["Colchão Queen", "Travesseiro"],
    "services": ["Entrega", "Consultoria"],
    "businessHours": {
      "seg": "09:00 - 18:00",
      "ter": "09:00 - 18:00"
    },
    "contactInfo": {
      "phone": "(11) 9999-9999",
      "email": "contato@empresa.com"
    },
    "lastScrapedAt": "2026-07-18T10:00:00Z"
  },
  "preview": "=== CONHECIMENTO DA EMPRESA ===\n📱 WEBSITE:\n..."
}
```

#### D. Obter Knowledge Base

```bash
curl http://localhost:3000/api/v1/companies/SEU_COMPANY_ID/knowledge \
  -H "Authorization: Bearer SEU_TOKEN"

# Resposta:
{
  "success": true,
  "data": {
    "id": "know_123",
    "websiteUrl": "...",
    "products": [...],
    "services": [...],
    "phone": "...",
    "email": "...",
    "lastScrapedAt": "..."
  }
}
```

---

## 🚀 USAR NO NAVEGADOR

### 1. Ir para Dashboard da Empresa

```
http://localhost:3000/companies/[COMPANY_ID]
```

### 2. Clicar em "🤖 IA Autônoma"

Você será levado para: `/companies/[COMPANY_ID]/ai-leads`

### 3. Configurar Base de Conhecimento

**Passo 1: Adicionar Website**
- Colar URL do site da empresa
- Clicar "Fazer Scrape"
- Sistema extrai automaticamente:
  - Produtos e serviços
  - Informações de contato
  - Horários de funcionamento
  - Conteúdo principal

**Passo 2: Revisar Informações**
- Ver produtos identificados
- Ver serviços
- Ver informações de contato
- Horários aparecem no painel

**Passo 3: Pronto!**
- Agora a IA conhece a empresa
- Pode responder leads automaticamente

---

## 📡 INTEGRAR COM FONTES DE LEADS

### Google Forms

1. **Criar automação no Google Forms**
   - Instalarplugin "Apps Script"
   - Criar script:

```javascript
function onFormSubmit(e) {
  const response = e.response;
  const itemResponses = response.getItemResponses();
  
  const data = {
    companyId: "SEU_COMPANY_ID",
    name: itemResponses[0].getResponse(),
    email: itemResponses[1].getResponse(),
    phone: itemResponses[2].getResponse(),
    message: itemResponses[3].getResponse(),
    source: "google"
  };
  
  UrlFetchApp.fetch("https://seusite.com/api/webhooks/lead-intake", {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(data)
  });
}
```

### Website Forms

1. **Adicionar ao formulário do site**

```html
<form id="contact-form">
  <input type="text" name="name" placeholder="Seu nome" required>
  <input type="email" name="email" placeholder="Seu email" required>
  <input type="tel" name="phone" placeholder="Seu telefone" required>
  <textarea name="message" placeholder="Sua mensagem" required></textarea>
  <button type="submit">Enviar</button>
</form>

<script>
document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  
  const response = await fetch('/api/webhooks/lead-intake', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      companyId: 'SEU_COMPANY_ID',
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      message: formData.get('message'),
      source: 'website'
    })
  });
  
  const result = await response.json();
  
  if (result.aiResponse.action === 'redirect_whatsapp') {
    // Redirecionar para WhatsApp
    const msg = encodeURIComponent(result.aiResponse.message);
    window.open(`https://wa.me/${COMPANY_WHATSAPP}?text=${msg}`);
  } else if (result.aiResponse.action === 'send_response') {
    // Mostrar resposta na página
    alert(result.aiResponse.message);
  }
});
</script>
```

### Email (Zapier/Make)

1. **Setup no Make.com**
   - Trigger: Novo email em inbox
   - Action: HTTP POST
   - URL: `https://seusite.com/api/webhooks/lead-intake`
   - Body:
   ```json
   {
     "companyId": "{{global.companyId}}",
     "name": "{{triggerOutput.parsed_email.from.name}}",
     "email": "{{triggerOutput.parsed_email.from.email}}",
     "message": "{{triggerOutput.parsed_email.text}}",
     "source": "email"
   }
   ```

### Instagram DM (Meta Webhook)

A integração com Instagram é via Meta Cloud API (já implementada em Fase 3).
O webhook `/api/webhooks/whatsapp` também processa mensagens do Instagram.

---

## 📊 FLUXO COMPLETO

```
1. Lead chega (site, Google, Instagram, email)
                   ↓
2. POST /api/webhooks/lead-intake
                   ↓
3. Sistema valida companyId
                   ↓
4. Busca CompanyKnowledge (site, produtos, etc)
                   ↓
5. Chama generateLeadResponse()
                   ↓
6. Claude analisa mensagem + conhecimento
                   ↓
7. Retorna:
   - Resposta (texto)
   - Ação (responder/redirecionar/atribuir)
   - Score (0-100)
   - Confiança (0-1)
                   ↓
8. Salva LeadInteraction (histórico)
                   ↓
9. Cria/atualiza Lead no CRM
                   ↓
10. Retorna resposta ao cliente
                   ↓
11. Se score > 60: redireciona para WhatsApp
    Se score < 30: atribui para humano
    Se score 30-60: envia resposta automática
```

---

## ⚙️ CONFIGURAÇÕES AVANÇADAS

### Customizar Prompt da IA

Editar em `src/lib/ai-leads/response-generator.ts`, função `buildSystemPrompt()`:

```typescript
function buildSystemPrompt(knowledge: any): string {
  return `Você é um assistente de vendas experiente da empresa.

CONHECIMENTO DA EMPRESA:
${JSON.stringify(knowledge, null, 2)}

INSTRUÇÕES CUSTOMIZADAS:
1. Se pergunta sobre preço → sempre mencione promoções
2. Se cliente em dúvida → ofereça agendar demo
3. Se pergunta técnica → responda com confiança
4. Sempre termine com CTA (call-to-action)

RESPONDA EM JSON...`;
}
```

### Alterar Limites de Score

Editar em `src/lib/ai-leads/response-generator.ts`:

```typescript
export function shouldRedirectToWhatsApp(
  actionType: string,
  qualificationScore: number
): boolean {
  return actionType === "redirect_whatsapp" || qualificationScore >= 60; // ← mudar 60
}
```

### Adicionar Novos Campos de Knowledge

Editar `prisma/schema.prisma`, modelo `CompanyKnowledge`:

```prisma
model CompanyKnowledge {
  id         String @id @default(cuid())
  companyId  String @unique
  
  // ... campos existentes ...
  
  // ADICIONAR NOVOS:
  faq        Json?  // Perguntas frequentes
  promotions Json?  // Promoções ativas
  team       Json?  // Equipe/especialistas
  
  @@index([companyId])
}
```

Depois rodarf migration:
```bash
npx prisma migrate dev --name "add_knowledge_fields"
```

---

## 🧪 TESTAR TUDO

### 1. Scrape de Website

```bash
npm run dev
```

Ir para `http://localhost:3000/companies/[ID]/ai-leads`

Colar URL: `https://www.example.com`

Clicar "Fazer Scrape"

Ver se produtos/serviços aparecem ✅

### 2. Lead Manual

```bash
# Terminal
curl -X POST http://localhost:3000/api/webhooks/lead-intake \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "cl...",
    "name": "Teste",
    "email": "teste@test.com",
    "phone": "+5511999999999",
    "message": "Qual o preço?",
    "source": "website"
  }'
```

Ver resposta JSON ✅

### 3. Verificar BD

```bash
# Terminal
npx prisma studio

# Navegar para CompanyKnowledge
# Ver registros criados ✅

# Navegar para LeadInteraction
# Ver histórico de respostas ✅
```

---

## 📈 PRÓXIMOS PASSOS

### Curto Prazo (Esta Semana)
- [ ] Testar com website real
- [ ] Integrar Google Forms
- [ ] Testar com leads reais

### Médio Prazo (Próximas 2 Semanas)
- [ ] Melhorar prompts com A/B testing
- [ ] Adicionar background jobs (Bull/Redis)
- [ ] Implementar Instagram Graph API real
- [ ] Dashboard de analytics

### Longo Prazo (1 Mês)
- [ ] Embeddings com Pinecone
- [ ] Busca semântica avançada
- [ ] Multi-idioma
- [ ] Histórico de conversas

---

## 🐛 TROUBLESHOOTING

### Erro: "Knowledge base not found"
→ Fazer scrape do website primeiro

### Erro: "ANTHROPIC_API_KEY not found"
→ Configurar variável de ambiente

### Erro: "Company not found"
→ Verificar se companyId está correto

### Erro: "Failed to scrape website"
→ Website pode estar bloqueando bots
→ Tentar URL diferente ou adicionar manual

---

## 📚 Arquivos Relacionados

- **Scraper:** `src/lib/ai-leads/scraper.ts`
- **AI Response:** `src/lib/ai-leads/response-generator.ts`
- **Webhook:** `src/app/api/webhooks/lead-intake/route.ts`
- **Knowledge API:** `src/app/api/v1/companies/[id]/knowledge/route.ts`
- **Dashboard:** `src/app/companies/[id]/ai-leads/page.tsx`
- **Schema:** `prisma/schema.prisma` (modelos CompanyKnowledge, LeadInteraction)

---

**Pronto para começar! 🚀**

Para dúvidas sobre a implementação, consulte `FEATURE_IA_AUTONOMA_LEADS.md` ou `PROGRESSO_FASES_1_2_3.md`.
