# ⚡ MASTER 01: QUICK START GUIDE

**Leia isto primeiro antes de começar a implementação**

---

## 📋 ORDEM CORRETA DE LEITURA

1. ✅ **MASTER_01_AUDIT_REPORT.md** - Entender estado atual
2. ✅ **MASTER_01_IMPLEMENTATION_PLAN.md** - Plano detalhado
3. ✅ **Este arquivo** - Quick reference durante execução

---

## 🎯 CHECKLIST PRÉ-IMPLEMENTAÇÃO

- [ ] Git branch criado: `master-01-enterprise-refactor`
- [ ] Ambiente rodando: `npm run dev`
- [ ] Todos os testes passando (antes)
- [ ] `.env.local` configurado corretamente
- [ ] Database conectado (Neon)

---

## 🚀 COMANDOS RÁPIDOS

### Criar Branch
```bash
cd "C:\projetos ia\herge"
git checkout -b master-01-enterprise-refactor
```

### Verificar Status
```bash
npm run build              # Deve passar
npm run dev                # Deve rodar sem erros
```

### Criar Pasta & Arquivo
```bash
mkdir -p src/core/auth
touch src/core/auth/types.ts
touch src/core/auth/service.ts
touch src/core/auth/middleware.ts
```

### Atualizar TypeScript Path
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@core/*": ["./src/core/*"],
      "@modules/*": ["./src/modules/*"],
      "@shared/*": ["./src/shared/*"],
      "@services/*": ["./src/services/*"],
      "@repositories/*": ["./src/repositories/*"]
    }
  }
}
```

---

## 📁 ESTRUTURA A CRIAR

### Pasta Base
```bash
mkdir -p src/core/{auth,tenant,permissions,audit,config,types}
mkdir -p src/modules/{ads,crm,whatsapp,financeiro,integrations,reports}/{services,repositories}
mkdir -p src/shared/{components/{ui,layout,common},hooks,utils,constants,types,styles}
mkdir -p src/services/{event-bus,cache,notifications,logging}
mkdir -p src/repositories
```

### Imports Path Update
Após criar pastas, atualizar `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@core/*": ["./src/core/*"],
      "@modules/*": ["./src/modules/*"],
      "@shared/*": ["./src/shared/*"],
      "@services/*": ["./src/services/*"],
      "@repositories/*": ["./src/repositories/*"]
    }
  }
}
```

---

## 🔄 PADRÕES DE CÓDIGO

### Service
```typescript
// src/modules/crm/services/lead.service.ts
import { prisma } from '@/lib/prisma';
import { LeadRepository } from '@repositories/lead.repository';

export class LeadService {
  private repository = new LeadRepository();

  async create(companyId: string, data: CreateLeadInput) {
    // Validar companyId
    // Chamar repository
    // Retornar resultado
  }
}
```

### Repository
```typescript
// src/repositories/lead.repository.ts
import { prisma } from '@/lib/prisma';
import type { Lead, Prisma } from '@prisma/client';

export class LeadRepository {
  async create(data: Prisma.LeadCreateInput): Promise<Lead> {
    return prisma.lead.create({ data });
  }

  async findById(id: string, companyId: string): Promise<Lead | null> {
    return prisma.lead.findFirst({
      where: { id, companyId }
    });
  }

  async findMany(companyId: string, filters?: any): Promise<Lead[]> {
    return prisma.lead.findMany({
      where: { companyId, ...filters }
    });
  }
}
```

### API Endpoint (Novo Padrão)
```typescript
// src/app/api/v1/companies/[companyId]/leads/route.ts
import { withCompanyAuth } from '@/core/auth/middleware';
import { LeadService } from '@modules/crm/services/lead.service';

const service = new LeadService();

export async function GET(req, context) {
  return withCompanyAuth(req, async (auth) => {
    const leads = await service.list(auth.companyId);
    return Response.json({ leads });
  });
}

export async function POST(req, context) {
  return withCompanyAuth(req, async (auth) => {
    const data = await req.json();
    const lead = await service.create(auth.companyId, data);
    return Response.json({ lead }, { status: 201 });
  });
}
```

### Component
```typescript
// src/shared/components/ui/Button.tsx
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'font-medium transition-colors',
        variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
        size === 'md' && 'px-4 py-2 text-sm',
      )}
      {...props}
    />
  );
}
```

---

## ✅ TESTES A FAZER (Por Fase)

### Após FASE 1 (Estrutura)
- [ ] `npm run build` - Deve compilar
- [ ] Sem erros de import
- [ ] Nenhuma rota quebrada

### Após FASE 2 (Service Layer)
- [ ] Testar `/api/v1/companies` - GET e POST
- [ ] Testar `/api/v1/companies/[id]/leads` - CRUD completo
- [ ] Testar `/dashboard` - Deve renderizar
- [ ] Dashboard deve carregar dados (ou "Aguardando integração")

### Após FASE 3 (Repository)
- [ ] Mesmos testes de FASE 2
- [ ] Verificar logs de query (não deve ter diferença)

### Após FASE 4 (Design System)
- [ ] Dashboard deve ter visual updated
- [ ] Buttons, Inputs, Cards usando novos componentes
- [ ] Responsive deve funcionar (mobile, tablet, desktop)

### Após FASE 5 (Security)
- [ ] Middleware deve rejeitar requests não autenticados
- [ ] 401 em endpoints sem token
- [ ] 403 em endpoints com companyId diferente

### Após FASE 6 (Docs & Tests)
- [ ] Documentação deve estar atualizada
- [ ] Testes devem rodar: `npm test`

---

## 🐛 TROUBLESHOOTING

### Erro: "Cannot find module '@core/auth'"
**Solução:** Verificar se `tsconfig.json` foi atualizado com paths

### Erro: "Module not found: src/core/auth/service.ts"
**Solução:** Verificar se arquivo foi criado no caminho correto

### Build falhando com erros TypeScript
**Solução:** 
1. Verificar se tipos foram importados
2. Rodar `npm run build` para ver erros completos
3. Remover `ignoreBuildErrors: true` do next.config.ts

### Rota retorna 500
**Solução:**
1. Verificar console do servidor
2. Verificar se middleware de auth está sendo aplicado
3. Verificar se repository está retornando dados

### Dashboard mostrando "Aguardando integração"
**Solução:** Normal se queries não retornam dados. Não é erro.

---

## 📊 PROGRESS TRACKER

Usar este template para acompanhar progresso:

```markdown
## PHASE 1: ESTRUTURA
- [x] Criar pastas core/
- [x] Criar pastas modules/
- [ ] Criar pastas shared/
- [ ] Criar pastas services/
- [ ] Criar tsconfig paths
- [ ] Commit & merge

## PHASE 2: SERVICE LAYER
- [ ] AuthService
- [ ] CompanyService
- [ ] LeadService
- [ ] SaleService
- [ ] AdSyncService
- [ ] Atualizar APIs para usar services
- [ ] Testes manuais
- [ ] Commit & merge

...
```

---

## 🎓 REFERÊNCIAS RÁPIDAS

### Padrão de Erro
```typescript
// Errado
if (!data) {
  return Response.json({ error: 'Not found' }, { status: 404 });
}

// Correto
if (!data) {
  throw new NotFoundError('Lead not found');
}
```

### Padrão de Validação
```typescript
// Errado
if (!email || !email.includes('@')) {
  return Response.json({ error: 'Invalid email' }, { status: 400 });
}

// Correto
const validated = CreateLeadSchema.parse(body);
```

### Padrão de Auth
```typescript
// Errado
const session = await auth();
if (!session?.user?.id) return Response.json({ error: 'Unauthorized' });

// Correto
return withCompanyAuth(req, async (auth) => {
  // auth.userId, auth.companyId disponíveis
});
```

---

## 🎯 METAS FINAIS DO MASTER 01

Ao terminar, o projeto deve ter:

- ✅ **100% das funcionalidades atuais** operacionais
- ✅ **Zero breaking changes** em APIs
- ✅ **Estrutura modular** pronta para dezenas de módulos
- ✅ **Service & Repository layers** implementados
- ✅ **Design system** unificado
- ✅ **Segurança** padronizada
- ✅ **Documentação** atualizada
- ✅ **Base sólida** para MASTER 02

---

## 🚀 DEPOIS DO MASTER 01

1. **Merge para master** quando tudo passar
2. **Deploy para staging** e testar
3. **Preparar MASTER 02** - Feature flags & billing
4. **Celebrar** 🎉

---

**Bora começar! 💪**

Dúvidas? Consulte os docs principais.
