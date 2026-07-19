# 📋 MASTER 06 FASE 2: REVENUE SERVICES
## Implementação da Camada de Serviços

**Status:** 📅 PLANEJADO  
**Estimado:** ~2.000 linhas de código  
**Arquivos:** 8-10 novos services  
**Padrão:** Repository Pattern + Service Layer (SOLID/DDD)

---

## 🎯 OBJETIVO FASE 2

Criar a **camada de serviços** que implementa toda lógica de negócio do Revenue Engine:

```
Database (Prisma Models)
    ↓
Repositories (Data Access)
    ↓
Services (Business Logic)
    ↓
Controllers/APIs (Presentation)
```

---

## 🔧 SERVICES A CRIAR

### 1. **SaleService** (Gerenciar Vendas)

```typescript
// src/services/revenue/sale.service.ts

class SaleService {
  // CRUD
  async createSale(input: CreateSaleInput): Promise<RevenueSale>
  async getSale(saleId: string, companyId: string): Promise<RevenueSale>
  async listSales(input: ListSalesInput): Promise<PaginatedResult<RevenueSale>>
  async updateSale(saleId: string, input: UpdateSaleInput): Promise<RevenueSale>
  async deleteSale(saleId: string, companyId: string): Promise<void>

  // Status Workflow
  async changeStatus(saleId: string, newStatus: RevenueSaleStatus, userId: string)
  async markAsCompleted(saleId: string, attendantId: string)
  async markAsLost(saleId: string, lossReasonId: string, notes: string)
  async markAsCanceled(saleId: string, reason: string)

  // Bulk Operations
  async importSalesFromCSV(file: File, companyId: string)
  async exportSales(filters: SaleFilters, format: 'csv' | 'json')

  // Filtering & Search
  async searchSales(query: string, companyId: string)
  async getSalesByDateRange(startDate: Date, endDate: Date, companyId: string)
  async getSalesByAttendant(attendantId: string, companyId: string)
  async getSalesByStatus(status: RevenueSaleStatus, companyId: string)
}
```

**Responsabilidades:**
- ✅ Validar entrada
- ✅ Gerenciar transições de status
- ✅ Calcular profit/margin automaticamente
- ✅ Emitir eventos (SaleCreated, SaleUpdated, SaleCanceled)
- ✅ Auditoria em RevenueTimeline
- ✅ Isolamento por companyId

---

### 2. **RevenueService** (Calcular KPIs)

```typescript
// src/services/revenue/revenue.service.ts

class RevenueService {
  // KPI Calculations
  async calculateROAS(input: KPIInput): Promise<KPIResult>
  async calculateROI(input: KPIInput): Promise<KPIResult>
  async calculateCAC(input: KPIInput): Promise<KPIResult>
  async calculateCPA(input: KPIInput): Promise<KPIResult>
  async calculateLTV(input: KPIInput): Promise<KPIResult>
  async calculateMargin(input: KPIInput): Promise<KPIResult>
  async calculateConversionRate(input: KPIInput): Promise<KPIResult>
  async calculateAvgTicket(input: KPIInput): Promise<KPIResult>

  // Bulk KPI
  async calculateAllKPIs(input: KPIInput): Promise<AllKPIsResult>

  // Revenue Metrics
  async getTotalRevenue(companyId: string, dateRange: DateRange): Promise<Decimal>
  async getTotalProfit(companyId: string, dateRange: DateRange): Promise<Decimal>
  async getTotalCost(companyId: string, dateRange: DateRange): Promise<Decimal>
  async getSalesCount(companyId: string, dateRange: DateRange): Promise<number>
  async getTotalLeads(companyId: string, dateRange: DateRange): Promise<number>

  // By Segmentation
  async getRevenueByChannel(companyId: string, dateRange: DateRange)
  async getRevenueByProduct(companyId: string, dateRange: DateRange)
  async getRevenueByAttendant(companyId: string, dateRange: DateRange)
  async getRevenueByCampaign(companyId: string, dateRange: DateRange)

  // Comparisons
  async compareRevenue(period1: DateRange, period2: DateRange, companyId: string)
  async compareKPIs(period1: DateRange, period2: DateRange, companyId: string)
}
```

**Responsabilidades:**
- ✅ Implementar fórmulas financeiras (ROAS, ROI, CAC, CPA, LTV, margem)
- ✅ Agregar dados por múltiplas dimensões
- ✅ Comparar períodos (hoje vs semana passada, etc)
- ✅ Segmentação por canal, produto, vendedor
- ✅ Emitir eventos (KPICalculated, RevenueTrendDetected)

---

### 3. **IndicatorService** (Armazenar KPIs Calculados)

```typescript
// src/services/revenue/indicator.service.ts

class IndicatorService {
  // Store Indicators
  async storeIndicator(input: CreateIndicatorInput): Promise<RevenueIndicator>
  async bulkStoreIndicators(indicators: CreateIndicatorInput[]): Promise<void>

  // Retrieve
  async getIndicator(indicatorId: string): Promise<RevenueIndicator>
  async getIndicatorsByPeriod(companyId: string, period: Period): Promise<RevenueIndicator[]>
  async getIndicatorsByChannel(companyId: string, channel: string): Promise<RevenueIndicator[]>
  async getIndicatorsByCampaign(companyId: string, campaignId: string): Promise<RevenueIndicator[]>

  // Caching Strategy
  async cacheIndicators(companyId: string, period: Period): Promise<void>
  async invalidateCache(companyId: string): Promise<void>

  // Daily Calculation Job
  async calculateAndCacheDailyIndicators(): Promise<void> // Runs nightly via scheduler

  // Trending
  async detectTrends(companyId: string, metric: string): Promise<Trend[]>
  async getMetricTrend(companyId: string, metric: string, days: number): Promise<TrendData>
}
```

**Responsabilidades:**
- ✅ Armazenar KPIs pré-calculados (snapshot pattern)
- ✅ Cache de indicadores para queries rápidas
- ✅ Job diária para calcular + armazenar
- ✅ Detecção de tendências (aumento/queda)
- ✅ TTL para indicadores antigos (limpeza automática)

---

### 4. **LossService** (Análise de Perdas)

```typescript
// src/services/revenue/loss.service.ts

class LossService {
  // Loss Analysis
  async getLossReasons(companyId: string): Promise<RevenueLossReason[]>
  async createLossReason(input: CreateLossReasonInput): Promise<RevenueLossReason>

  // Loss Stats
  async getLossesByReason(companyId: string, dateRange: DateRange)
  async getLossRate(companyId: string, dateRange: DateRange): Promise<number> // %
  async getValueLost(companyId: string, dateRange: DateRange): Promise<Decimal>

  // Loss Timeline
  async getLossesByDate(companyId: string, dateRange: DateRange)
  async getTopLossReasons(companyId: string, limit: number)

  // Predictions
  async predictLikelyCause(sale: RevenueSale): Promise<LossReasonPrediction>

  // Alerts
  async checkLossRateAnomaly(companyId: string): Promise<boolean>
}
```

**Responsabilidades:**
- ✅ Gerenciar tipos de motivos de perda
- ✅ Análise de vendas perdidas por motivo
- ✅ Calcular taxa de perda (%)
- ✅ Identificar tendências em perdas
- ✅ Alertas quando taxa de perda aumenta

---

### 5. **CommissionService** (Gerenciar Comissões)

```typescript
// src/services/revenue/commission.service.ts

class CommissionService {
  // Calculate Commission
  async calculateCommission(saleId: string): Promise<Decimal>
  async calculateCommissionsByAttendant(attendantId: string, dateRange: DateRange): Promise<Decimal>

  // Manage Commission Status
  async markCommissionAsPending(commissionId: string)
  async markCommissionAsCalculated(commissionId: string)
  async markCommissionAsPaid(commissionId: string, paidDate: Date)

  // Reports
  async getCommissionReport(companyId: string, dateRange: DateRange)
  async getCommissionsByAttendant(companyId: string)
  async getCommissionsSummary(companyId: string, period: Period)

  // Batch Operations
  async calculateAllPendingCommissions(companyId: string)
  async payCommissions(companyId: string, attendantIds: string[])
}
```

**Responsabilidades:**
- ✅ Calcular comissão por venda (fixa ou percentual)
- ✅ Agregar por vendedor
- ✅ Rastrear status (pending → calculated → paid)
- ✅ Relatório de comissões
- ✅ Bulk payment preparation

---

### 6. **RankingService** (Rankings & Scoring)

```typescript
// src/services/revenue/ranking.service.ts

class RankingService {
  // Campaign Rankings
  async rankCampaigns(companyId: string, metric: 'revenue' | 'roas' | 'roi' | 'profit'): Promise<CampaignRanking[]>

  // Product Rankings
  async rankProducts(companyId: string, metric: 'revenue' | 'margin' | 'quantity'): Promise<ProductRanking[]>

  // Attendant Rankings
  async rankAttendants(companyId: string, metric: 'revenue' | 'conversions' | 'avgTicket'): Promise<AttendantRanking[]>

  // Channel Rankings
  async rankChannels(companyId: string, metric: 'roas' | 'roi' | 'cac'): Promise<ChannelRanking[]>

  // Scoring
  async calculateAttendantScore(attendantId: string, companyId: string): Promise<number> // 0-100
  async calculateCampaignScore(campaignId: string, companyId: string): Promise<number>
  async calculateProductScore(productId: string, companyId: string): Promise<number>

  // Storeando Scores
  async bulkUpdateScores(companyId: string): Promise<void> // Daily job
}
```

**Responsabilidades:**
- ✅ Ranking por múltiplas métricas
- ✅ Score numérico (0-100)
- ✅ Comparação relativa
- ✅ Histórico de rankings
- ✅ Detectar mudanças de posição

---

### 7. **ForecastService** (Projeções)

```typescript
// src/services/revenue/forecast.service.ts

class ForecastService {
  // Forecast Generation
  async generateForecast(input: ForecastInput): Promise<RevenueForecast>
  async generateMonthlyForecast(companyId: string, startDate: Date): Promise<RevenueForecast[]>

  // Forecast Accuracy
  async validateForecast(forecastId: string): Promise<ForecastAccuracy> // Compara com realizado
  async calculateForecastError(forecastId: string): Promise<number> // % error

  // Confidence Levels
  async recalculateConfidence(forecastId: string): Promise<void>

  // Multiple Scenarios
  async generateOptimisticScenario(companyId: string, month: Month): Promise<RevenueForecast>
  async generatePessimisticScenario(companyId: string, month: Month): Promise<RevenueForecast>
  async generateMostLikelyScenario(companyId: string, month: Month): Promise<RevenueForecast>

  // Alerts
  async checkIfActualVsForecast(companyId: string): Promise<boolean> // Deviou muito?
}
```

**Responsabilidades:**
- ✅ Gerar projeções baseadas em histórico
- ✅ Múltiplos cenários (otimista, pessimista, provável)
- ✅ Nível de confiança (0-100%)
- ✅ Validar projeção vs realizado
- ✅ Alertas de desvios

---

### 8. **GoalService** (Gerenciar Metas)

```typescript
// src/services/revenue/goal.service.ts

class GoalService {
  // CRUD
  async createGoal(input: CreateGoalInput): Promise<RevenueGoal>
  async getGoal(goalId: string): Promise<RevenueGoal>
  async listGoals(companyId: string): Promise<RevenueGoal[]>
  async updateGoal(goalId: string, input: UpdateGoalInput): Promise<RevenueGoal>
  async deleteGoal(goalId: string): Promise<void>

  // Progress
  async getGoalProgress(goalId: string): Promise<GoalProgressData>
  async updateGoalProgress(goalId: string, currentValue: Decimal): Promise<void>
  async calculateProgressPercent(goal: RevenueGoal): Promise<number>

  // Status
  async checkGoalStatus(goalId: string): Promise<GoalStatus> // 'active' | 'completed' | 'missed'
  async markGoalAsCompleted(goalId: string)
  async markGoalAsMissed(goalId: string)

  // Alerts
  async checkGoalAlert(goalId: string): Promise<boolean> // Atingiu alerta de 80%?
  async checkAllGoalsStatus(companyId: string): Promise<GoalStatusReport>
}
```

**Responsabilidades:**
- ✅ Criar e gerenciar metas
- ✅ Rastrear progresso (%)
- ✅ Atualizar valores reais automaticamente
- ✅ Status (ativa, completa, falhada)
- ✅ Alertas em marcos (80%, 100%)

---

## 🏗️ PADRÕES DE IMPLEMENTAÇÃO

### Repository Pattern

```typescript
// src/repositories/revenue/sale.repository.ts

class SaleRepository implements IRepository<RevenueSale> {
  async create(data: CreateSaleInput): Promise<RevenueSale>
  async findById(id: string, companyId: string): Promise<RevenueSale | null>
  async findMany(filter: Filter): Promise<RevenueSale[]>
  async update(id: string, data: UpdateSaleInput): Promise<RevenueSale>
  async delete(id: string, companyId: string): Promise<void>

  // Custom Queries
  async findByDateRange(companyId: string, startDate: Date, endDate: Date)
  async findByStatus(companyId: string, status: RevenueSaleStatus)
  async findByCampaign(companyId: string, campaignId: string)
  async findByAttendant(companyId: string, attendantId: string)
}
```

**Princípios:**
- ✅ Isolamento do banco (Prisma) nos repositories
- ✅ Services usam repositories, nunca Prisma direto
- ✅ Queries sempre filtram por companyId
- ✅ Índices utilizados eficientemente

---

### Dependency Injection

```typescript
// src/services/revenue/sale.service.ts

class SaleService {
  constructor(
    private saleRepository: SaleRepository,
    private indicatorService: IndicatorService,
    private eventBus: EventBus,
    private logger: Logger
  ) {}
}
```

**Benefícios:**
- ✅ Fácil de testar (mock repositories)
- ✅ Desacoplamento
- ✅ Reutilização de serviços

---

### Event-Driven

```typescript
// Eventos emitidos pelos services

class SaleService {
  async createSale(input: CreateSaleInput) {
    const sale = await this.saleRepository.create(input);
    
    // Emitir eventos
    this.eventBus.emit('sale:created', { saleId: sale.id, companyId: sale.companyId });
    this.eventBus.emit('revenue:updated', { companyId: sale.companyId });
    
    return sale;
  }
}
```

**Eventos:**
```
- sale:created
- sale:updated
- sale:completed
- sale:lost
- sale:canceled
- commission:calculated
- forecast:generated
- goal:reached
- goal:missed
- revenue:updated
- indicator:updated
- anomaly:detected
```

---

## 📊 ARQUITETURA DE PASTA

```
src/services/revenue/
├── sale.service.ts
├── revenue.service.ts
├── indicator.service.ts
├── loss.service.ts
├── commission.service.ts
├── ranking.service.ts
├── forecast.service.ts
├── goal.service.ts
└── index.ts (exports)

src/repositories/revenue/
├── sale.repository.ts
├── indicator.repository.ts
├── commission.repository.ts
├── goal.repository.ts
├── forecast.repository.ts
├── loss.repository.ts
└── index.ts (exports)

src/types/revenue/
├── sale.types.ts
├── indicator.types.ts
├── goal.types.ts
└── forecast.types.ts
```

---

## ✅ CHECKLIST IMPLEMENTAÇÃO

### Por Service:
- [ ] SaleService
  - [ ] CRUD completo
  - [ ] Status workflow
  - [ ] Timeline tracking
  - [ ] Eventos emitidos
  - [ ] Testes unitários

- [ ] RevenueService
  - [ ] Todas as fórmulas KPI
  - [ ] Agregações por segmento
  - [ ] Comparativos
  - [ ] Testes matemáticos

- [ ] IndicatorService
  - [ ] Store indicators
  - [ ] Cache strategy
  - [ ] Daily job
  - [ ] Trend detection

- [ ] LossService
  - [ ] Loss analysis
  - [ ] Stats e predictions
  - [ ] Alertas

- [ ] CommissionService
  - [ ] Cálculo automático
  - [ ] Relatórios
  - [ ] Status workflow

- [ ] RankingService
  - [ ] Rankings multi-métrica
  - [ ] Scoring
  - [ ] Histórico

- [ ] ForecastService
  - [ ] Forecast generation
  - [ ] Múltiplos cenários
  - [ ] Validação

- [ ] GoalService
  - [ ] CRUD
  - [ ] Progress tracking
  - [ ] Alertas

---

## 🔐 SEGURANÇA & ISOLAMENTO

```typescript
// SEMPRE filtrar por companyId
async getSales(companyId: string): Promise<RevenueSale[]> {
  return this.saleRepository.findMany({
    where: { companyId }, // ✅ Obrigatório
  });
}

// ❌ NUNCA aceitar queries sem companyId
async getSales(): Promise<RevenueSale[]> {
  return this.saleRepository.findMany({}); // PERIGO!
}
```

---

## 📋 PRÓXIMO PASSO

Após implementar FASE 2 Services:
- ✅ Criar Prisma migration
- ✅ Implementar 8 Services
- ✅ Criar Repositories
- ✅ Setup Event Bus
- ✅ Testes unitários

**FASE 3:** REST APIs (rotas que consomem esses services)

---

**STATUS:** 📅 PRONTO PARA IMPLEMENTAÇÃO

**Estimativa:** 2-3 dias para implementação completa com testes

*Arquitetura segue SOLID, DDD e Repository Pattern consolidados no HERGÉ*
