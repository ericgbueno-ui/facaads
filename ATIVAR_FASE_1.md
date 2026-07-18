# 🚀 ATIVAR FASE 1 - COMANDOS E PRÓXIMOS PASSOS

**Status:** Código pronto, aguardando ativação no banco  
**Data:** 2026-07-18  
**Tempo estimado:** 15 minutos

---

## 📋 Checklist de Ativação

### ✅ Fase 1 Já Concluída
- [x] Schema Prisma atualizado
- [x] Auth middleware implementado
- [x] Endpoints de API criados
- [x] Páginas React criadas
- [x] Validação Zod adicionada
- [x] Auditoria integrada

### 🔧 Próximos: Preparar Banco de Dados

---

## 1️⃣ EXECUTAR MIGRATIONS

### Opção A: Criar Migration (RECOMENDADO)
```bash
cd "C:\projetos ia\herge"

# Criar migration a partir do schema atual
npx prisma migrate dev --name "Add_company_multitenant_auth"
```

**O que faz:**
- Compara schema.prisma com estado atual do DB
- Cria arquivo SQL da migração em `prisma/migrations/`
- Executa migração no banco
- Regenera Prisma Client

**Tempo:** ~30 segundos

### Opção B: Apenas Regenerar (Se já migrou manualmente)
```bash
npx prisma generate
```

---

## 2️⃣ VERIFICAR BANCO DE DADOS

### Conectar ao DB
```bash
# Abrir Prisma Studio (GUI visual do DB)
npx prisma studio
```

**Verificar:**
- [ ] Tabela `Company` existe
- [ ] Tabela `CompanyUser` existe
- [ ] Tabela `Permission` existe
- [ ] Tabela `AuditLog` existe
- [ ] Colunas adicionadas em `User` (defaultCompanyId)
- [ ] Colunas adicionadas em `AdAccount` (companyId)
- [ ] Índices criados

### Query Teste (SQL)
```sql
-- Verificar tabelas criadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'Company%';

-- Verificar coluna em User
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'User' AND column_name = 'defaultCompanyId';
```

---

## 3️⃣ REINICIAR SERVIDOR DE DESENVOLVIMENTO

```bash
# Kill servidor anterior (Ctrl+C se rodando)
# Limpar cache Next.js
rm -r .next

# Reiniciar servidor
npm run dev
```

**Esperado:**
- Servidor inicia em http://localhost:3000
- Prisma Client regenerado com novos modelos
- Sem erros de TypeScript

---

## 4️⃣ TESTAR MUDANÇAS

### Testar Login
```
http://localhost:3000
```

**Credenciais:**
- Email: `ericgbueno@gmail.com`
- Senha: `portaaberta`

**Esperado:**
- Redireciona para `/companies` (não mais `/projects`)

### Testar Criar Empresa
1. Na página `/companies`, clicar em "✨ Criar Nova Empresa"
2. Preencher formulário
3. Clicar "Criar Empresa"

**Esperado:**
- Empresa criada com sucesso
- Usuário automaticamente vinculado como owner
- Aparece na lista

### Testar Acessar Empresa
1. Clicar em um card de empresa
2. Ir para `/companies/[id]`

**Esperado:**
- Página carrega
- Mostra informações da empresa
- Mostra estatísticas (leads, sales, ad accounts)
- Mostra usuários vinculados

### Testar Isolamento (Segurança)
```bash
# No console do navegador, tentar acessar empresa de outro usuário
fetch('/api/v1/companies/OUTRO_ID')

# Esperado: erro 403 "Acesso negado à empresa"
```

---

## 5️⃣ VERIFICAR LOGS

### Next.js Server
```
Deve mostrar:
✓ Rotas compiladas com sucesso
✓ Sem erros de TypeScript
✓ Prisma Client inicializado
```

### Database
Verificar em `PRAGMA table_info()` ou `information_schema`:
- Company table: 16 colunas
- CompanyUser table: 7 colunas
- Permission table: 4 colunas
- AuditLog table: 11 colunas

---

## 6️⃣ VALIDAR ENDPOINTS

### Test 1: Listar Empresas
```bash
curl -X GET http://localhost:3000/api/v1/companies \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Test 2: Criar Empresa
```bash
curl -X POST http://localhost:3000/api/v1/companies \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Empresa Teste",
    "segment": "ecommerce",
    "city": "São Paulo",
    "state": "SP"
  }'
```

### Test 3: Obter Detalhes
```bash
curl -X GET http://localhost:3000/api/v1/companies/COMPANY_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🚨 Troubleshooting

### Erro: "Prisma Client gerou erro"
**Solução:**
```bash
rm -rf node_modules/.prisma
npx prisma generate
npm run dev
```

### Erro: "Não consegue conectar ao banco"
**Verificar:**
- [ ] .env.local tem DATABASE_URL?
- [ ] Banco está rodando?
- [ ] Conexão Neon ativa?

```bash
# Testar conexão
npx prisma db push
```

### Erro: "Tabela não existe"
**Solução:**
```bash
# Refazer migrations
npx prisma migrate reset

# AVISO: Isso apaga dados! Apenas em dev
```

### Erro: "TypeScript: 'CompanyUser' não existe"
**Solução:**
```bash
# Regenerar tipos
npx prisma generate

# Limpar cache TypeScript
rm -rf .next
npm run dev
```

---

## ✅ Validação Final

### Checklist
- [ ] Servidor inicia sem erros
- [ ] Página `/companies` carrega
- [ ] Criar empresa funciona
- [ ] Acessar empresa funciona
- [ ] Isolamento de dados funciona (403)
- [ ] Auditoria registra ações
- [ ] Banco tem novos modelos

### Performance
- [ ] Página carrega em < 1 segundo
- [ ] Criar empresa em < 2 segundos
- [ ] Sem N+1 queries

---

## 📝 Commits Git

### Recomendado fazer commit após ativar
```bash
cd "C:\projetos ia\herge"

# Ver mudanças
git status

# Adicionar tudo
git add .

# Commit
git commit -m "feat: phase 1 foundation - multi-tenancy and company management

- Add 14 new Prisma models (Company, CompanyUser, Lead, Sale, etc)
- Extend 4 existing models with companyId
- Implement auth middleware for company isolation
- Create /api/v1/companies endpoints (GET, POST, PUT, DELETE)
- Create /companies dashboard pages
- Add audit logging for all actions
- Implement role-based access control
- Add 30+ database indexes for performance"
```

---

## 🎯 Próximas Fases

Após validar Fase 1, prosseguir com:

### Fase 2: CRM (Semana 2-3)
- [ ] Lead management
- [ ] CRM pipeline (customizável)
- [ ] Lead activity tracking
- [ ] Endpoints para leads

### Fase 3: WhatsApp (Semana 3-4)
- [ ] WhatsApp integration
- [ ] IA analysis
- [ ] Message tracking
- [ ] Conversation history

### Fase 4: Financeiro (Semana 4-5)
- [ ] Sales dashboard
- [ ] Profit & commission tracking
- [ ] Payment status
- [ ] Financial reports

---

## 📞 Suporte

### Se algo quebrar:
1. Verificar logs do servidor
2. Confirmar DATABASE_URL
3. Ver TROUBLESHOOTING acima
4. Reverter commit anterior se necessário

### Se funcionar:
1. ✅ Fazer push para repositório
2. ✅ Atualizar documentação
3. ✅ Começar Fase 2

---

## ⏱️ Tempo Total

| Etapa | Tempo |
|-------|-------|
| Migrations | 1 min |
| Servidor reiniciar | 2 min |
| Testes manuais | 5 min |
| Validações | 3 min |
| Git commit | 1 min |
| **TOTAL** | **~12 minutos** |

---

**Pronto para ativar? Vamos começar! 🚀**

Execute os comandos na ordem e teste conforme as instruções.
