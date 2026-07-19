# MASTER 06 FASE 2 — REVENUE SERVICES (COMPLETO)

**Status:** ✅ 100% CONCLUÍDO  
**Data:** 2026-07-18  
**Versão:** 8/8 Services + Exports

---

## RESUMO EXECUTIVO

8 serviços de receita implementados seguindo **Repository Pattern + Service Layer**.

Cada serviço:
- ✅ Type-safe (TypeScript strict)
- ✅ Multi-tenant (companyId em todas queries)
- ✅ Event-driven (EventBus)
- ✅ Decimal precision (Prisma Decimal)
- ✅ Parallelization (Promise.all onde aplicável)

---

## SERVIÇOS IMPLEMENTADOS

### 1. **SaleService** (src/services/revenue/sale.service.ts)
- `createSale()` — Registrar venda com cálculo automático de profit/margin
- `getSale()`, `listSales()`, `updateSale()`, `deleteSale()`
- `completeSale()`, `loseSale()`, `cancelSale()`
- `getMetrics()`, `getSalesByDateRange()`
- **Agregações:** sumByStatus, sumByAttendant, sumByCampaign
- **Eventos:** sale:created, sale:completed, sale:lost

---

### 2. **RevenueService** (src/services/revenue/revenue.service.ts)
- KPI Calculations (parallelizadas com Promise.all)
  - `calculateROAS()` — Revenue / Ad Spend
  - `calculateROI()` — (Profit / Investment) * 100
  - `calculateCAC()` — Total Cost / New Customers
  - `calculateCPA()` — Cost Per Acquisition
  - `calculateLTV()` — Customer Lifetime Value
  - `calculateMargin()` — (Profit / Revenue) * 100
  - `calculateConversionRate()` — (Sales / Leads) * 100
  - `calculateAvgTicket()` — Total Revenue / Sales Count
- `calculateAllKPIs()` — Todos KPIs em paralelo
- `compareKPIs()`, `detectTrends()`, `detectAnomalies()`

---

### 3. **IndicatorService** (src/services/revenue/indicator.service.ts)
- **Snapshot Storage:** storeIndicator(), bulkStoreIndicators()
- **Period Queries:** getIndicator(), getTodayIndicator(), getCurrentMonthIndicator()
- **Cache Management:** calculateAndCacheDailyIndicators(), invalidateCache()
- **Trend Detection:** detectTrends(), interpretTrend()
- **Cleanup:** cleanupOldIndicators() (remove > 180 days)
- **Cache Strategy:** 24h TTL com Map in-memory

---

### 4. **CommissionService** (src/services/revenue/commission.service.ts)
- CRUD: createCommission(), getCommission(), updateCommission()
- **Status Management:** markAsCalculated(), markAsPaid()
- **Queries:** getPending(), getByAttendant(), getSumByAttendant(), getSumByPeriod()
- `calculateCommissionAmount()` — Regra de comissão
- `getTopEarners()` — Rankings de comissionistas
- `generateReport()` — Relatório detalhado
- `processPayment()` — Marcar como pagos e emitir eventos

---

### 5. **LossService** (src/services/revenue/loss.service.ts)
- **Loss Reason Management:** createReason(), getReason(), getActiveReasons()
- **Analysis:** analyzeLosses() — Período com breakdown por motivo
- **Anomaly Detection:** detectAnomalies() — Alerta de taxa anormal
- **Queries:** getLossesByReason(), getLossRate(), getTotalValueLost(), getTopReasons()

---

### 6. **RankingService** (src/services/revenue/ranking.service.ts)
- `rankCampaigns()` — Por revenue/roas/roi/profit
- `rankAttendants()` — Por revenue/conversions/avgTicket
- `rankProducts()` — Por revenue/quantity/margin
- `rankChannels()` — Por roas/roi/cac
- `calculateScore()` — Scoring normalizado 0-100

---

### 7. **ForecastService** (src/services/revenue/forecast.service.ts)
- `generateForecast()` — Projeção mensal baseada em últimos 30 dias
- `generateMonthlyForecast()` — 3 meses de projeção
- `getForecasts()` — Histórico de forecasts
- `validateForecast()` — Comparar projeção vs real (error rate)

---

### 8. **GoalService** (src/services/revenue/goal.service.ts)
- CRUD: createGoal(), getGoal(), listGoals(), deleteGoal()
- **Progress Tracking:** updateProgress() — Auto-detect achievement
- **Status Management:** completeGoal(), failGoal()
- `getProgress()` — Dashboard com % complete, remaining, daysRemaining
- **Eventos:** goal:created, goal:achieved, goal:failed

---

## ARQUIVOS CRIADOS

```
src/
├── services/revenue/
│   ├── sale.service.ts (350 linhas)
│   ├── revenue.service.ts (450 linhas)
│   ├── indicator.service.ts (380 linhas)
│   ├── commission.service.ts (320 linhas)
│   ├── loss.service.ts (200 linhas)
│   ├── ranking.service.ts (102 linhas) ← NOVO
│   ├── forecast.service.ts (96 linhas) ← NOVO
│   ├── goal.service.ts (126 linhas) ← NOVO
│   └── index.ts (atualizado com exports)
│
├── repositories/revenue/
│   ├── sale.repository.ts
│   ├── revenue.repository.ts
│   ├── indicator.repository.ts
│   ├── commission.repository.ts
│   └── loss.repository.ts
│
└── types/revenue/
    ├── sale.types.ts
    ├── kpi.types.ts
    ├── indicator.types.ts
    ├── commission.types.ts
    └── loss.types.ts
```

---

## SCHEMA PRISMA (12 ENTITIES)

```prisma
model RevenueSale
model RevenueSource
model RevenueProduct
model RevenueIndicator
model RevenueLossReason
model RevenueTimeline
model RevenueGoal
model RevenueForecast
model RevenueCommission
model RevenueScore

// Enums
enum RevenueSaleStatus { VENDA_REALIZADA, VENDA_CANCELADA, VENDA_PERDIDA }
enum RevenueSourceType { CAMPANHA, FUNIL, REDE_SOCIAL, OUTRO }
enum RevenueLossReasonType { PRECO, CONCORRENTE, SEM_INTERESSE, SEM_RETORNO, SEM_ESTOQUE, PRAZO, OUTRO }
```

---

## EVENTOS EMITIDOS

Por Service:

| Service | Evento | Payload |
|---------|--------|---------|
| Sale | sale:created | companyId, saleId, totalAmount |
| Sale | sale:completed | companyId, saleId, profit |
| Sale | sale:lost | companyId, saleId, reason |
| Commission | commission:created | companyId, commissionId, amount |
| Commission | commission:paid | companyId, attendantId, totalPaid |
| Loss | loss:reason_created | companyId, reasonId, reason |
| Forecast | forecast:generated | companyId, forecastDate, projectedRevenue |
| Goal | goal:created | companyId, goalId, metric |
| Goal | goal:achieved | companyId, goalId, metric |
| Goal | goal:failed | companyId, goalId, metric, reason |

---

## PADRÕES APLICADOS

### Multi-Tenant Isolation
```typescript
// Toda query inclui companyId
const sales = await prisma.revenueSale.findMany({
  where: { companyId, status: 'VENDA_REALIZADA' },
});
```

### Type Safety
```typescript
// DTOs para entrada
interface CreateSaleDTO {
  companyId: string;
  totalAmount: Decimal;
  status: RevenueSaleStatus;
}

// Response types
interface SaleResponse {
  id: string;
  totalAmount: number;
  profitMargin: number;
}
```

### Event-Driven
```typescript
this.eventBus.emit('sale:completed', {
  companyId,
  saleId: sale.id,
  profit: sale.totalProfit.toNumber(),
});
```

### Parallelization
```typescript
const [roas, roi, cac, cpa] = await Promise.all([
  this.calculateROAS(companyId, period),
  this.calculateROI(companyId, period),
  this.calculateCAC(companyId, period),
  this.calculateCPA(companyId, period),
]);
```

---

## PRÓXIMAS FASES

### FASE 3: REST APIs
- Endpoints para consumir cada serviço
- Validação de input
- Error handling
- Rate limiting

### FASE 4: Dashboard UI
- Componentes React/Next.js
- Gráficos (Charts)
- Real-time updates (WebSocket)
- Filters & exports

### FASE 5: Documentação Final
- OpenAPI/Swagger
- Exemplos de uso
- Best practices
- Troubleshooting guide

---

## CHECKLIST PRÉ-PRODUÇÃO

- [x] 8 services implementados
- [x] Type-safe (TypeScript strict)
- [x] Multi-tenant (companyId filtering)
- [x] Event-driven (EventBus)
- [x] Decimal precision (currency)
- [x] Repository pattern
- [x] Service layer separation
- [x] Exports centralizados
- [ ] Unit tests
- [ ] Integration tests
- [ ] API endpoints
- [ ] Dashboard UI
- [ ] Monitoring & logging

---

## COMANDOS ÚTEIS

### Compilar TypeScript
```bash
npm run build
```

### Gerar tipos Prisma
```bash
npx prisma generate
```

### Migrar schema
```bash
npx prisma migrate dev --name add_revenue_services
```

---

## DEPENDÊNCIAS

```json
{
  "@prisma/client": "^5.x",
  "decimal.js": "^10.x",
  "eventemitter2": "^6.x"
}
```

---

**MASTER 06 FASE 2 FINALIZADO**  
**Próximo:** Implementar REST APIs (FASE 3)
