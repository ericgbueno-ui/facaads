# MASTER 06 FASE 3 — REST API DOCUMENTATION

**Status:** ✅ 100% COMPLETO  
**Version:** 1.0.0  
**Base URL:** `/api/revenue`

---

## 📋 TABLE OF CONTENTS

1. [Authentication](#authentication)
2. [Sales API](#sales-api)
3. [KPIs API](#kpis-api)
4. [Indicators API](#indicators-api)
5. [Commissions API](#commissions-api)
6. [Loss API](#loss-api)
7. [Ranking API](#ranking-api)
8. [Forecast API](#forecast-api)
9. [Goals API](#goals-api)
10. [Error Handling](#error-handling)

---

## Authentication

All endpoints require `companyId` as query parameter:

```bash
GET /api/revenue/sales?companyId=company-123
```

### Headers
```
Content-Type: application/json
Authorization: Bearer {token} # Opcional, implementar no middleware de auth
```

---

## Sales API

### Create Sale
```http
POST /api/revenue/sales?companyId=company-123

{
  "totalAmount": 1500.00,
  "status": "VENDA_REALIZADA",
  "leadId": "lead-123",
  "campaignId": "campaign-456",
  "attendantId": "attendant-789",
  "attendantName": "João Silva",
  "products": [
    {
      "id": "product-1",
      "name": "Produto A",
      "quantity": 2,
      "unitPrice": 750.00,
      "totalPrice": 1500.00
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "id": "sale-123",
  "companyId": "company-123",
  "totalAmount": 1500.00,
  "totalProfit": 900.00,
  "profitMargin": 0.60,
  "status": "VENDA_REALIZADA",
  "saleDate": "2026-07-18T10:30:00Z"
}
```

### List Sales
```http
GET /api/revenue/sales?companyId=company-123&status=VENDA_REALIZADA&limit=50
```

**Response:** `200 OK`
```json
[
  { /* sale object */ },
  { /* sale object */ }
]
```

### Get Sale Detail
```http
GET /api/revenue/sales/sale-123?companyId=company-123
```

### Update Sale
```http
PATCH /api/revenue/sales/sale-123?companyId=company-123

{
  "status": "VENDA_CANCELADA",
  "totalAmount": 1200.00
}
```

### Delete Sale
```http
DELETE /api/revenue/sales/sale-123?companyId=company-123
```

**Response:** `204 No Content`

---

## KPIs API

### Get All KPIs
```http
GET /api/revenue/kpis?companyId=company-123&startDate=2026-06-18&endDate=2026-07-18
```

**Response:** `200 OK`
```json
{
  "roas": {
    "value": 3.45,
    "trend": "up",
    "changePercent": 12.5
  },
  "roi": {
    "value": 245.0,
    "trend": "up"
  },
  "cac": {
    "value": 150.50,
    "trend": "down"
  },
  "cpa": {
    "value": 200.00
  },
  "ltv": {
    "value": 5000.00
  },
  "margin": {
    "value": 60.0
  },
  "conversionRate": {
    "value": 25.5
  },
  "avgTicket": {
    "value": 1500.00
  }
}
```

### Get Specific KPI
```http
GET /api/revenue/kpis?companyId=company-123&metric=roas&startDate=2026-06-18&endDate=2026-07-18
```

Supported metrics: `roas`, `roi`, `cac`, `cpa`, `ltv`, `margin`, `conversion`, `avgticket`

---

## Indicators API

### Store Indicator
```http
POST /api/revenue/indicators?companyId=company-123

{
  "date": "2026-07-18",
  "totalRevenue": 50000.00,
  "totalCost": 20000.00,
  "totalProfit": 30000.00,
  "roas": 2.5,
  "roi": 150.0,
  "cac": 100.00,
  "margin": 60.0,
  "campaignId": "campaign-456",
  "channel": "instagram"
}
```

### Get Indicators
```http
GET /api/revenue/indicators?companyId=company-123&period=today&limit=30
```

Supported periods: `today`, `month`, ou últimos `limit` registros

---

## Commissions API

### Create Commission
```http
POST /api/revenue/commissions?companyId=company-123

{
  "saleId": "sale-123",
  "attendantId": "attendant-789",
  "attendantName": "João Silva",
  "amount": 150.00,
  "percentage": 10.0,
  "status": "PENDENTE"
}
```

### List Commissions
```http
GET /api/revenue/commissions?companyId=company-123
GET /api/revenue/commissions?companyId=company-123&attendantId=attendant-789
GET /api/revenue/commissions?companyId=company-123&status=PENDENTE
```

---

## Loss API

### Create Loss Reason
```http
POST /api/revenue/losses?companyId=company-123

{
  "reason": "PRECO",
  "description": "Cliente achou preço alto",
  "displayOrder": 1
}
```

### Analyze Losses
```http
GET /api/revenue/losses?companyId=company-123&action=analyze&startDate=2026-06-18&endDate=2026-07-18
```

**Response:**
```json
{
  "period": { "startDate": "2026-06-18", "endDate": "2026-07-18" },
  "summary": {
    "totalLosses": 45,
    "totalValueLost": 67500.00,
    "lossRate": 18.5
  },
  "byReason": [
    {
      "reason": "PRECO",
      "count": 20,
      "totalValueLost": 30000.00,
      "percent": 44.4
    }
  ],
  "topReason": { /* top reason */ }
}
```

### Detect Anomalies
```http
GET /api/revenue/losses?companyId=company-123&action=anomalies&startDate=2026-07-11&endDate=2026-07-18
```

---

## Ranking API

### Get Campaign Rankings
```http
GET /api/revenue/rankings?companyId=company-123&type=campaigns&metric=revenue&limit=10
```

Metrics: `revenue`, `roas`, `roi`, `profit`

### Get Attendant Rankings
```http
GET /api/revenue/rankings?companyId=company-123&type=attendants&metric=revenue&limit=10
```

Metrics: `revenue`, `conversions`, `avgTicket`

### Get Product Rankings
```http
GET /api/revenue/rankings?companyId=company-123&type=products&metric=revenue&limit=10
```

Metrics: `revenue`, `quantity`, `margin`

### Get Channel Rankings
```http
GET /api/revenue/rankings?companyId=company-123&type=channels&metric=roas&limit=10
```

Metrics: `roas`, `roi`, `cac`

---

## Forecast API

### Generate Forecast
```http
POST /api/revenue/forecasts?companyId=company-123

{
  "type": "single",
  "forecastDate": "2026-08-18",
  "confidence": 80
}
```

### Generate Monthly Forecasts
```http
POST /api/revenue/forecasts?companyId=company-123

{
  "type": "monthly",
  "startDate": "2026-08-01"
}
```

### Get Forecasts
```http
GET /api/revenue/forecasts?companyId=company-123&limit=12
```

### Validate Forecast
```http
GET /api/revenue/forecasts?companyId=company-123&forecastId=forecast-123
```

---

## Goals API

### Create Goal
```http
POST /api/revenue/goals?companyId=company-123

{
  "metric": "revenue",
  "targetValue": 100000.00,
  "period": "monthly",
  "endDate": "2026-08-31"
}
```

### List Goals
```http
GET /api/revenue/goals?companyId=company-123
GET /api/revenue/goals?companyId=company-123&status=IN_PROGRESS
```

### Get Goal Progress
```http
GET /api/revenue/goals?companyId=company-123&action=progress
```

**Response:**
```json
[
  {
    "id": "goal-123",
    "metric": "revenue",
    "target": 100000.00,
    "current": 65000.00,
    "progress": 65.0,
    "remaining": 35.0,
    "daysRemaining": 14
  }
]
```

### Update Goal Progress
```http
PATCH /api/revenue/goals/goal-123?companyId=company-123

{
  "currentValue": 75000.00
}
```

### Complete Goal
```http
PATCH /api/revenue/goals/goal-123?companyId=company-123

{
  "action": "complete"
}
```

### Fail Goal
```http
PATCH /api/revenue/goals/goal-123?companyId=company-123

{
  "action": "fail",
  "reason": "Market conditions changed"
}
```

### Delete Goal
```http
DELETE /api/revenue/goals/goal-123?companyId=company-123
```

---

## Error Handling

### Standard Error Response
```json
{
  "error": "Missing or invalid companyId",
  "code": "INVALID_COMPANY_ID"
}
```

### Status Codes
| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 404 | Not Found |
| 500 | Internal Server Error |

### Error Codes
- `INVALID_COMPANY_ID` — Missing or invalid companyId
- `INVALID_REQUEST` — Invalid request body
- `NOT_FOUND` — Resource not found
- `INTERNAL_ERROR` — Server error

---

## Rate Limiting

Implementar no middleware future:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1626604800
```

---

## Examples

### Complete Flow: Create Sale → Calculate KPIs
```bash
# 1. Create sale
curl -X POST http://localhost:3000/api/revenue/sales?companyId=company-123 \
  -H "Content-Type: application/json" \
  -d '{
    "totalAmount": 5000,
    "status": "VENDA_REALIZADA",
    "campaignId": "campaign-1"
  }'

# 2. Get KPIs
curl http://localhost:3000/api/revenue/kpis?companyId=company-123

# 3. Get Rankings
curl http://localhost:3000/api/revenue/rankings?companyId=company-123&type=campaigns&metric=revenue
```

---

**Documentation v1.0.0**  
**Last Updated:** 2026-07-18
