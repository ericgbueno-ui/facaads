# 🔗 MASTER 06 + MASTER 05 INTEGRATION
## Revenue Engine ↔ HERGÉ CONNECT

**Objetivo:** Mapear como o Revenue Engine (MASTER 06) consome dados do CONNECT (MASTER 05)

---

## 🏗️ ARQUITETURA INTEGRADA

```
FONTES EXTERNAS
    ↓
┌─────────────────────┐
│  HERGÉ CONNECT      │  (MASTER 05)
│  Integration Hub    │
├─────────────────────┤
│ • Meta Provider     │
│ • Google Provider   │
│ • TikTok Provider   │
│ • Shopee Provider   │
│ • WhatsApp Provider │
│ • Payment Providers │
│ • Queue (BullMQ)    │
│ • Scheduler         │
│ • Webhooks          │
└────────┬────────────┘
         │
         │ Events emitted
         ↓
┌─────────────────────────────────────┐
│  REVENUE ENGINE (MASTER 06)          │
│  Intelligence Layer                 │
├─────────────────────────────────────┤
│ • SaleService                       │
│ • RevenueService (KPI calculations) │
│ • IndicatorService (caching)        │
│ • LossService                       │
│ • CommissionService                 │
│ • RankingService                    │
│ • ForecastService                   │
│ • GoalService                       │
├─────────────────────────────────────┤
│ Database (12 Revenue Entities)      │
└─────────────────────────────────────┘
         ↓
    Dashboard + APIs
```

---

## 📡 FLUXOS DE DADOS

### Fluxo 1: Meta Ads → Revenue

```
1. Usuário conecta conta Meta ao CONNECT
   POST /api/v1/integrations/connect { provider: "META", code: "..." }

2. CONNECT armazena token (criptografado)
   └─→ Connection.status = "connected"

3. Scheduler sincroniza periodicamente (4/4h)
   └─→ SYNC job enfileirado

4. Meta Provider puxa dados
   ├─→ Campanhas
   ├─→ Anúncios
   ├─→ Spent
   ├─→ Conversões
   └─→ Cliques

5. Dados armazenados em Campaign + AdAccount
   └─→ campaign.spend, campaign.clicks, campaign.conversions

6. Revenue Engine consome
   RevenueService.calculateROAS({
     campaignId: "...",
     totalInvestment: campaign.spend,
     totalRevenue: SUM(revenueSale.totalAmount WHERE campaignId=...)
   })

7. KPI salvo em RevenueIndicator
   └─→ indicator.roas = 3.5

8. Dashboard exibe
   └─→ Meta: R$ 3.450 invested → R$ 12.075 revenue → ROAS 3.5x
```

---

### Fluxo 2: Shopee Shop → Revenue

```
1. Usuário conecta loja Shopee ao CONNECT
   POST /api/v1/integrations/connect { provider: "SHOPEE", code: "..." }

2. CONNECT armazena credenciais (criptografado)

3. Shopee Provider sincroniza pedidos
   ├─→ Order ID
   ├─→ Customer email
   ├─→ Products
   ├─→ Total price
   ├─→ Status (paid/pending/canceled)
   └─→ Payment date

4. Dados criados como RevenueSale
   POST /services/revenue/sale.create({
     clientEmail: order.customer.email,
     totalAmount: order.totalPrice,
     products: order.items.map(...),
     source: RevenueSource.SHOPEE,
     paymentStatus: order.status,
     ...
   })

5. Timeline registra origem
   RevenueTimeline.create({
     saleId: sale.id,
     eventType: "sync_shopee",
     source: "CONNECT/Shopee",
     ...
   })

6. Revenue calculado
   RevenueService.calculateMetrics({
     channel: "SHOPEE",
     period: "today",
     ...
   })

7. Dashboard exibe
   └─→ Shopee: 45 vendas, R$ 8.750, Ticket médio R$ 194
```

---

### Fluxo 3: Payment Provider → Commission

```
1. Webhook do Mercado Pago entra
   POST /api/v1/integrations/webhooks
   { provider: "MERCADO_PAGO", topic: "payment.updated", ... }

2. CONNECT valida HMAC
   └─→ Signature ✅ válida

3. Enfileira job WEBHOOK
   └─→ Queue.add(QueueType.WEBHOOK, payload)

4. Queue processor executa
   PaymentProvider.handlePayment({
     paymentId: "...",
     status: "approved",
     amount: 500.00,
     ...
   })

5. Encontra RevenueSale associada
   RevenueSale.update({
     paymentStatus: "paid",
     paymentDate: now,
     ...
   })

6. Calcula comissão automaticamente
   CommissionService.calculateCommission(saleId)
   └─→ R$ 50 (10% de R$ 500)

7. Salva RevenueCommission
   └─→ commission.status = "calculated"

8. Revenue atualizado
   RevenueService.calculateAllKPIs({ saleId })

9. Dashboard atualizado em tempo real
   └─→ Real-time payment confirmation
```

---

### Fluxo 4: WhatsApp Attendant → Sale Creation

```
1. Mensagem recebida no WhatsApp Cloud API
   POST /api/v1/integrations/webhooks
   { provider: "WHATSAPP", type: "message", from: "+55..." }

2. CONNECT valida webhook
   └─→ Autenticação ✅ válida

3. Enfileira job WEBHOOK
   └─→ Processa mensagem

4. CRM cria Lead (ou já existe)
   Lead.create({ phone: "+55...", source: "WHATSAPP", ... })

5. Usuário responde na UI do CRM
   "Confirmado a venda de R$ 300"

6. CRM cria RevenueSale
   RevenueSale.create({
     leadId: lead.id,
     clientPhone: lead.phone,
     totalAmount: 300,
     attendantId: user.id,
     source: RevenueSource.WHATSAPP,
     status: RevenueSaleStatus.VENDA_REALIZADA,
     ...
   })

7. RevenueTimeline registra
   timeline.eventType = "sale_completed_via_whatsapp"

8. ComissionService calcula
   commission = 300 * 0.1 = R$ 30

9. Revenue Engine agrega
   RevenueService.calculateMetrics({
     channel: "WHATSAPP",
     attendant: user.id,
     ...
   })

10. Ranking atualizado
    RankingService.rankAttendants()
    └─→ User rank: #2 (Top sellers this month)
```

---

## 🔄 SINCRONIZAÇÃO CONTÍNUA

### Scheduler Jobs (CONNECT)

```typescript
// Rodando continuamente via CONNECT Scheduler

// Job 1: Sync Meta Ads (4/4h)
scheduler.schedule('sync-meta', '0 */4 * * *', async () => {
  const metaProvider = getProvider('META');
  const connections = await findConnections('META', { status: 'connected' });
  
  for (const conn of connections) {
    queue.enqueue(QueueType.SYNC, {
      connectionId: conn.id,
      provider: 'META',
    });
  }
});

// Job 2: Sync Google Ads (4/4h)
scheduler.schedule('sync-google', '0 */4 * * *', async () => {
  // Similar to Meta
});

// Job 3: Sync Shopee Orders (2/2h)
scheduler.schedule('sync-shopee', '0 */2 * * *', async () => {
  // Sync Shopee orders
});

// Job 4: Calculate Daily Revenue KPIs (2:00 AM)
scheduler.schedule('calculate-kpis', '0 2 * * *', async () => {
  const revenueService = new RevenueService(...);
  
  const companies = await findAllCompanies();
  for (const company of companies) {
    // Calculate yesterday's KPIs
    const kpis = await revenueService.calculateAllKPIs({
      companyId: company.id,
      period: 'day',
      date: yesterday,
    });
    
    // Store in RevenueIndicator
    await indicatorService.bulkStoreIndicators(kpis);
  }
});
```

---

## 📊 FLUXO COMPLETO: Meta Ads → Dashboard

```
┌─ Dia 1 ────────────────────────────────┐
│ Usuário cria campanha no Meta          │
│ └─→ Spend: R$ 3.450                    │
│     Leads: 150                         │
│     Cliques: 890                       │
└────────────────────────────────────────┘

     ↓ (4 horas depois)

┌─ Meta Provider ─────────────────────────┐
│ Sincroniza dados via CONNECT            │
│ └─→ campaign.spend = 3.450              │
│     campaign.clicks = 890               │
│     campaign.conversions = 150          │
└────────────────────────────────────────┘

     ↓ (Mesma noite)

┌─ Revenue Engine ────────────────────────┐
│ 1. SaleService consulta Campaign        │
│ 2. Busca RevenueSale onde campaignId=X │
│    └─→ 45 vendas confirmadas            │
│        R$ 12.075 revenue                │
│                                         │
│ 3. RevenueService calcula KPIs          │
│    ├─→ ROAS = 12.075 / 3.450 = 3.5x   │
│    ├─→ ROI = ((8.625 / 3.450) × 100)   │
│    │         = 250%                    │
│    ├─→ CAC = 3.450 / 45 = R$ 76.67    │
│    └─→ LTV = 12.075 / 45 = R$ 268     │
│                                         │
│ 4. IndicatorService armazena            │
│    └─→ RevenueIndicator created        │
│        period: "day"                    │
│        date: "2026-07-18"               │
│        channel: "META"                  │
│        campaignId: "cmp_123"            │
│        roas: 3.5                        │
│        roi: 250                         │
│        ...                              │
└────────────────────────────────────────┘

     ↓ (Dashboard refresh)

┌─ Visualization ─────────────────────────┐
│                                         │
│  Meta Ads (Today)                       │
│  ┌─────────────────────────────┐        │
│  │ Investimento:   R$ 3.450   │        │
│  │ Receita:       R$ 12.075   │        │
│  │ Lucro:          R$ 8.625   │        │
│  │                             │        │
│  │ ROAS:         3.5x  ↑ 0.2x │        │
│  │ ROI:          250%  ↑ 15%  │        │
│  │ CAC:         R$ 76.67 ↓    │        │
│  │ Conversão:     30%  ↑ 5%   │        │
│  └─────────────────────────────┘        │
│                                         │
│  Comparativo vs Semana Passada:         │
│  ROAS: 3.5x vs 3.1x (+12.9%)            │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🎯 EVENTOS EMITIDOS

### CONNECT → Revenue Engine

```typescript
// Quando Meta sincroniza
EventBus.emit('integration:sync:completed', {
  provider: 'META',
  connectionId: 'conn_abc123',
  companyId: 'comp_456',
  data: {
    campaigns: [...],
    spend: 3450,
    conversions: 150,
  }
});

// Revenue Engine listener
EventBus.on('integration:sync:completed', async (event) => {
  if (event.provider === 'META') {
    // Atualiza Campaign
    await campaignRepo.update(event.data.campaignId, {
      spend: event.data.spend,
    });
    
    // Recalcula KPIs
    await revenueService.calculateAllKPIs({
      campaignId: event.data.campaignId,
      companyId: event.companyId,
    });
  }
});
```

### Revenue Engine → Dashboard

```typescript
// Quando KPI é calculado
EventBus.emit('revenue:kpi:calculated', {
  companyId: 'comp_456',
  period: 'day',
  metrics: {
    roas: 3.5,
    roi: 250,
    cac: 76.67,
    ltv: 268,
  }
});

// Dashboard listener (WebSocket)
WebSocket.on('revenue:kpi:calculated', (data) => {
  updateDashboard(data);
  showNotification(`ROAS atualizado: ${data.roas}x`);
});
```

---

## 🔐 SEGURANÇA NA INTEGRAÇÃO

### Multi-Tenant Isolation

```typescript
// ✅ CORRETO: Sempre filtrar por companyId

class SaleService {
  async getSalesByCampaign(campaignId: string, companyId: string) {
    return db.query(`
      SELECT * FROM RevenueSale
      WHERE campaignId = ? AND companyId = ?
    `, [campaignId, companyId]);
  }
}

// ❌ ERRADO: Nunca aceitar query sem companyId

class SaleService {
  async getSalesByCampaign(campaignId: string) {
    return db.query(`
      SELECT * FROM RevenueSale
      WHERE campaignId = ?
    `, [campaignId]); // PERIGO! Exposição de dados
  }
}
```

### Token Isolation

```typescript
// CONNECT armazena tokens por tenant

class TokenManager {
  async storeToken(token: string, companyId: string) {
    // 1. Criptografa com AES-256
    const encrypted = encrypt(token, process.env.TOKEN_ENCRYPTION_KEY);
    
    // 2. Armazena associado a companyId
    db.create('Connection', {
      companyId,
      provider: 'META',
      accessToken: encrypted,
      ...
    });
  }
  
  async getToken(companyId: string, provider: string) {
    // 3. Sempre filtra por companyId
    const connection = db.findFirst('Connection', {
      where: { companyId, provider },
    });
    
    // 4. Descriptografa
    return decrypt(connection.accessToken);
  }
}
```

---

## 📋 CHECKLIST INTEGRAÇÃO

### Setup CONNECT

- [ ] Meta Provider implementado
- [ ] Google Provider implementado
- [ ] Shopee Provider implementado
- [ ] WhatsApp Provider implementado
- [ ] Payment Providers implementados
- [ ] Queue BullMQ + Redis rodando
- [ ] Scheduler jobs configuradas
- [ ] Webhooks validadas com HMAC

### Setup Revenue Engine

- [ ] Database migration executada
- [ ] 8 Services implementados
- [ ] Event Bus integrado com CONNECT
- [ ] Repositories testados
- [ ] Multi-tenant isolation verificada

### Integração

- [ ] CONNECT emite eventos ao concluir sync
- [ ] Revenue Engine processa eventos
- [ ] Dados sincronizados corretamente
- [ ] KPIs calculados automaticamente
- [ ] Timeline auditada
- [ ] Logs estruturados e verificados

### Testing

- [ ] Test data: Meta sync → RevenueSale creation ✅
- [ ] Test data: Shopee order → RevenueSale creation ✅
- [ ] Test workflow: Payment webhook → commission calculation ✅
- [ ] Test multi-tenant: Empresa A vs Empresa B isolation ✅
- [ ] Test performance: 1.000 vendas/dia → KPI em <2s ✅

---

## 📞 DEBUGGING INTEGRATION

### Problema: Vendas não aparecem após sync

```typescript
// 1. Verificar se CONNECT está sincronizando
GET /api/v1/integrations/status?connectionId=conn_abc123
// Response deve ter lastSyncAt recente

// 2. Verificar fila
queue.getJobCounts('integration:sync')
// Deve estar vazia (jobs processados)

// 3. Verificar RevenueSale criada
SELECT * FROM RevenueSale
WHERE companyId = 'comp_456'
AND createdAt > NOW() - INTERVAL 1 HOUR

// 4. Verificar logs
logs.search({
  companyId: 'comp_456',
  level: 'ERROR',
  timeRange: 'last 1 hour'
})

// 5. Se vazio: Check manual sync
POST /api/v1/integrations/sync
{ connectionId: 'conn_abc123', companyId: 'comp_456' }
```

### Problema: KPIs não calculados

```typescript
// 1. Verificar Job de cálculo
scheduler.getJobStatus('calculate-kpis')
// Deve estar "running" às 2:00 AM

// 2. Se falhou: Check logs
logs.search({
  level: 'ERROR',
  action: 'calculate-kpis',
  timeRange: 'last 1 day'
})

// 3. Verificar RevenueIndicator
SELECT * FROM RevenueIndicator
WHERE companyId = 'comp_456'
AND date = '2026-07-18'

// 4. Se vazio: Run manual calculation
revenueService.calculateAllKPIs({
  companyId: 'comp_456',
  period: 'day',
  date: '2026-07-18'
})
```

---

## 🚀 PRÓXIMOS PASSOS

1. ✅ CONNECT implementado (MASTER 05)
2. ✅ Revenue Engine schema pronto (MASTER 06 FASE 1)
3. 📅 Implementar integrações específicas por provider
4. 📅 Testar fluxos completos (Meta → Dashboard)
5. 📅 Performance testing (1.000+ eventos/dia)
6. 📅 Setup alertas e monitoring

---

**Status:** 🔗 PRONTO PARA INTEGRAÇÃO

**Próxima:** Implementar event listeners no Revenue Engine quando FASE 2 (Services) estiver pronta.
