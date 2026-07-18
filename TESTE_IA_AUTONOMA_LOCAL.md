# 🧪 TESTE LOCAL: IA Autônoma para Leads

**Objetivo:** Guia completo para testar a IA Autônoma localmente  
**Tempo:** ~30 minutos  
**Requisitos:** Node.js, npm, Chrome/Firefox

---

## 📋 Checklist Pré-requisitos

- [ ] Node.js instalado (`node --version`)
- [ ] npm instalado (`npm --version`)
- [ ] Repositório clonado
- [ ] .env.local configurado
- [ ] PostgreSQL/Neon ativo
- [ ] ANTHROPIC_API_KEY configurada

---

## 🚀 PASSO 1: Setup Local

### 1.1 Instalar Dependências

```bash
cd "C:\projetos ia\herge"
npm install
```

### 1.2 Instalar Cheerio (Web Scraper)

```bash
npm install cheerio
```

### 1.3 Verificar .env.local

```bash
cat .env.local | grep -E "DATABASE_URL|ANTHROPIC_API_KEY"
```

Deve retornar:
```
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=sk-ant-...
```

### 1.4 Rodar Migrations (se necessário)

```bash
npx prisma migrate dev
```

---

## ✅ PASSO 2: Iniciar Servidor Dev

```bash
npm run dev
```

Deve retornar:
```
> herge@0.0.1 dev
> next dev

  ▲ Next.js 14.0.0
  - Local:        http://localhost:3000
  - Environments: .env.local

✓ Ready in 2.5s
```

---

## 🧪 PASSO 3: Testar Health Check

### Via Terminal (curl)

```bash
curl http://localhost:3000/api/webhooks/lead-intake
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "endpoint": "/api/webhooks/lead-intake",
  "methods": ["POST"]
}
```

✅ Se receber isso, o webhook está online!

---

## 📊 PASSO 4: Testar Dashboard UI

### 4.1 Abrir Navegador

```
http://localhost:3000/companies
```

### 4.2 Criar Empresa Teste

- Clicar "Criar Empresa"
- Nome: "Teste Autônoma"
- Segment: "Teste"
- Clicar "Criar"

**Anote o ID da empresa** (ex: `cl...xyz`)

### 4.3 Ir para IA Autônoma

- Clicar no card "🤖 IA Autônoma"
- Você deve ver o formulário de scraping

✅ Dashboard carregado com sucesso!

---

## 🌐 PASSO 5: Testar Website Scraping

### 5.1 Fazer Scrape de Website

No formulário do dashboard:

1. **Cole uma URL de teste:**
   ```
   https://www.example.com
   ```
   
   Ou tente um site real (ex: `https://www.google.com`)

2. **Clique "Fazer Scrape"**

3. **Aguarde 2-5 segundos**

### 5.2 Verificar Resultado

Você deve ver:
- ✅ "Website scraped successfully!"
- Produtos identificados aparecem
- Contato extraído
- Horários aparecem

### 5.3 Conferir no Banco

```bash
npx prisma studio
```

- Abrir `CompanyKnowledge`
- Procurar seu companyId
- Ver dados salvos ✅

---

## 💬 PASSO 6: Testar Lead Intake

### 6.1 Enviar Lead Manual (curl)

```bash
# Substituir SEU_COMPANY_ID pelo ID obtido em PASSO 4.2
curl -X POST http://localhost:3000/api/webhooks/lead-intake \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "SEU_COMPANY_ID",
    "name": "João Silva",
    "email": "joao@teste.com",
    "phone": "+5511999999999",
    "message": "Qual o preço do seu produto?",
    "source": "website"
  }'
```

### 6.2 Analisar Resposta

**Resposta esperada:**
```json
{
  "success": true,
  "leadId": "lead_123",
  "aiResponse": {
    "message": "Oi João! Ótima pergunta... [resposta da IA]",
    "action": "redirect_whatsapp",
    "qualification": 75,
    "confidence": 0.92
  }
}
```

✅ IA respondeu com sucesso!

### 6.3 Múltiplos Testes

Teste diferentes mensagens:

```bash
# Teste 1: Pergunta simples
curl -X POST http://localhost:3000/api/webhooks/lead-intake \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "SEU_COMPANY_ID",
    "name": "Maria",
    "email": "maria@test.com",
    "message": "Vocês funcionam aos finais de semana?",
    "source": "website"
  }'

# Teste 2: Pergunta complexa
curl -X POST http://localhost:3000/api/webhooks/lead-intake \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "SEU_COMPANY_ID",
    "name": "Pedro",
    "email": "pedro@test.com",
    "message": "Como funciona a integração com meu ERP antigo?",
    "source": "email"
  }'

# Teste 3: Sem email (só telefone)
curl -X POST http://localhost:3000/api/webhooks/lead-intake \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "SEU_COMPANY_ID",
    "name": "Ana",
    "phone": "+5521988776655",
    "message": "Qual é o melhor plano para iniciar?",
    "source": "instagram"
  }'
```

---

## 📁 PASSO 7: Verificar Dados no CRM

### 7.1 Abrir Prisma Studio

```bash
npx prisma studio
```

Browser abre automático em `http://localhost:5555`

### 7.2 Verificar Tabelas

**CompanyKnowledge:**
- [x] Dados do website scrapeado
- [x] Produtos identificados
- [x] Contatos extraídos
- [x] lastScrapedAt atualizado

**LeadInteraction:**
- [x] Todos os leads recebidos
- [x] Respostas da IA
- [x] Scores de qualificação
- [x] Timestamps corretos

**Lead:**
- [x] Leads criados automaticamente
- [x] Vinculados à empresa
- [x] Source preenchido
- [x] estimatedValue calculado

✅ Dados corretos no banco!

---

## 🔍 PASSO 8: Verificar Logs

### 8.1 Terminal (npm run dev)

Procure por:
```
[API] POST /api/webhooks/lead-intake - 200
[DB] Saved LeadInteraction: lead_123
[AI] Claude response received: score=75
```

### 8.2 Console do Navegador

Abrir DevTools (F12) → Console

Procurar por warnings/errors

Tudo verde? ✅

---

## 🚨 PASSO 9: Troubleshooting

### Erro: "Knowledge base not found"

**Solução:**
1. Fazer scrape do website primeiro (Passo 5)
2. Verificar companyId no curl

### Erro: "ANTHROPIC_API_KEY not found"

**Solução:**
```bash
# Verificar .env.local
cat .env.local | grep ANTHROPIC_API_KEY

# Se não encontrar, adicionar:
echo "ANTHROPIC_API_KEY=sk-ant-xxxx" >> .env.local

# Reiniciar servidor:
Ctrl+C
npm run dev
```

### Erro: "Company not found"

**Solução:**
```bash
# Verificar ID correto no Prisma Studio
npx prisma studio

# Copiar ID exato da tabela Company
# Usar no curl
```

### Erro: "Database connection failed"

**Solução:**
```bash
# Verificar DATABASE_URL
cat .env.local | grep DATABASE_URL

# Testar conexão:
npx prisma db push

# Se falhar, contatar administrador do banco
```

### Resposta vazia ou null

**Solução:**
1. Verificar que a empresa tem CompanyKnowledge
2. Verificar que Claude API está respondendo
3. Revisar ANTHROPIC_API_KEY

```bash
# Testar API key diretamente:
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: sk-ant-xxxx" \
  -H "anthropic-version: 2023-06-01" \
  -d '{"model":"claude-opus-4-8","max_tokens":100,"messages":[{"role":"user","content":"oi"}]}'
```

---

## 📊 PASSO 10: Teste de Carga (Opcional)

### 10.1 Enviar 10 Leads em Sequência

```bash
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/webhooks/lead-intake \
    -H "Content-Type: application/json" \
    -d "{
      \"companyId\": \"SEU_COMPANY_ID\",
      \"name\": \"Lead $i\",
      \"email\": \"lead$i@test.com\",
      \"message\": \"Teste de carga - mensagem $i\",
      \"source\": \"website\"
    }"
  echo "Lead $i enviado"
  sleep 1
done
```

### 10.2 Verificar Performance

```bash
time curl -X POST http://localhost:3000/api/webhooks/lead-intake \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "SEU_COMPANY_ID",
    "name": "Teste Speed",
    "email": "speed@test.com",
    "message": "Qual o tempo de resposta?",
    "source": "website"
  }'
```

**Esperado:** < 2 segundos por request

✅ Performance OK!

---

## 🎯 RESUMO DO TESTE

| Etapa | Status | Tempo |
|-------|--------|-------|
| 1. Setup | ✅ | 2 min |
| 2. Dev Server | ✅ | 1 min |
| 3. Health Check | ✅ | 30 seg |
| 4. Dashboard | ✅ | 2 min |
| 5. Web Scrape | ✅ | 5 min |
| 6. Lead Intake | ✅ | 5 min |
| 7. Verify DB | ✅ | 2 min |
| 8. Check Logs | ✅ | 1 min |
| 9. Troubleshoot | ✅ | 3 min |
| 10. Load Test | ✅ | 5 min |
| **TOTAL** | **✅** | **~30 min** |

---

## ✨ PROXIMOS TESTES

### Teste com Website Real
```bash
curl -X POST http://localhost:3000/api/v1/companies/SEU_ID/knowledge/scrape-website \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "websiteUrl": "https://seusite.com.br"
  }'
```

### Teste de Integração (Google Forms)
→ Seguir instruções em `IA_AUTONOMA_SETUP.md`

### Teste de Integração (Website Form)
→ Adicionar código HTML/JS do `IA_AUTONOMA_SETUP.md`

---

## 📝 Checklist Final

- [ ] Dependências instaladas
- [ ] Servidor rodando
- [ ] Health check OK
- [ ] Dashboard abre
- [ ] Website scraped
- [ ] Leads recebidos
- [ ] IA respondeu
- [ ] Dados no BD
- [ ] Logs OK
- [ ] Sem erros críticos

---

## 🎉 Parabéns!

Se chegou até aqui com tudo verde, a **IA Autônoma está funcional localmente**!

**Próximos passos:**
1. Testar com websites/leads reais
2. Integrar com Google Forms
3. Deploy em staging
4. Validar com cliente
5. Deploy em produção

---

**Dúvidas?** Consulte `IA_AUTONOMA_SETUP.md` ou `PROGRESSO_IA_AUTONOMA.md`

**Problema encontrado?** Abra issue no GitHub com:
- Erro exato
- Passo que falhou
- Output do terminal
- Versão do Node/npm
