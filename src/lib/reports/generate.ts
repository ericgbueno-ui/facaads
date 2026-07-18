/**
 * Serviço para gerar relatórios em diferentes formatos
 */

interface Sale {
  id: string;
  amount: number;
  profit?: number;
  commission?: number;
  productName?: string;
  quantity?: number;
  paymentStatus: string;
  source: string;
  notes?: string;
  createdAt: string;
}

interface ReportData {
  companyName: string;
  period: { startDate?: string; endDate?: string };
  totals: {
    sales: number;
    revenue: number;
    profit: number;
    commission: number;
    quantity: number;
  };
  metrics: {
    averageTicket: number;
    profitMargin: number;
    conversionRate: number;
    profitPerSale: number;
  };
  sales: Sale[];
}

/**
 * Gerar CSV
 */
export function generateCSV(data: ReportData): string {
  const headers = [
    "ID",
    "Produto",
    "Valor",
    "Lucro",
    "Comissão",
    "Quantidade",
    "Fonte",
    "Status",
    "Data",
  ];

  const rows = data.sales.map((sale) => [
    sale.id,
    sale.productName || "Sem nome",
    sale.amount.toFixed(2),
    (sale.profit || 0).toFixed(2),
    (sale.commission || 0).toFixed(2),
    sale.quantity || 1,
    sale.source,
    sale.paymentStatus,
    new Date(sale.createdAt).toLocaleDateString("pt-BR"),
  ]);

  // Adicionar resumo
  rows.push([]);
  rows.push(["RESUMO", "", "", "", "", "", "", "", ""]);
  rows.push([
    "Total de Vendas",
    data.totals.sales.toString(),
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  rows.push([
    "Receita Total",
    `R$ ${data.totals.revenue.toFixed(2)}`,
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  rows.push([
    "Lucro Total",
    `R$ ${data.totals.profit.toFixed(2)}`,
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  rows.push([
    "Comissão Total",
    `R$ ${data.totals.commission.toFixed(2)}`,
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  rows.push([
    "Ticket Médio",
    `R$ ${data.metrics.averageTicket.toFixed(2)}`,
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  rows.push([
    "Margem de Lucro",
    `${data.metrics.profitMargin.toFixed(2)}%`,
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  // Converter para CSV
  let csv = headers.join(",") + "\n";
  rows.forEach((row) => {
    csv += row.map((cell) => `"${cell}"`).join(",") + "\n";
  });

  return csv;
}

/**
 * Gerar HTML para PDF
 */
export function generateHTML(data: ReportData): string {
  const today = new Date().toLocaleDateString("pt-BR");

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório Financeiro</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background: white;
      padding: 40px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 2px solid #1f2937;
      padding-bottom: 20px;
    }
    .header h1 {
      font-size: 28px;
      color: #1f2937;
      margin-bottom: 10px;
    }
    .header p {
      color: #6b7280;
      font-size: 14px;
    }
    .kpis {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 40px;
    }
    .kpi-card {
      border: 1px solid #e5e7eb;
      padding: 20px;
      border-radius: 8px;
      background: #f9fafb;
    }
    .kpi-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    .kpi-value {
      font-size: 24px;
      font-weight: bold;
      color: #1f2937;
    }
    .kpi-subtitle {
      font-size: 12px;
      color: #9ca3af;
      margin-top: 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 30px 0;
    }
    table thead {
      background: #f3f4f6;
      border-bottom: 2px solid #d1d5db;
    }
    table th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
      font-size: 13px;
      color: #374151;
    }
    table td {
      padding: 10px 12px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 13px;
    }
    table tr:nth-child(even) {
      background: #f9fafb;
    }
    .text-right {
      text-align: right;
    }
    .status-completed {
      background: #d1fae5;
      color: #065f46;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
    }
    .status-pending {
      background: #fef3c7;
      color: #92400e;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
    }
    .status-failed {
      background: #fee2e2;
      color: #7f1d1d;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      color: #9ca3af;
      font-size: 12px;
      border-top: 1px solid #e5e7eb;
      padding-top: 20px;
    }
    @media print {
      body {
        padding: 0;
      }
      .kpis {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Relatório Financeiro</h1>
    <p>${data.companyName}</p>
    <p>Período: ${
      data.period.startDate && data.period.endDate
        ? `${data.period.startDate} a ${data.period.endDate}`
        : "Todos os períodos"
    }</p>
  </div>

  <div class="kpis">
    <div class="kpi-card">
      <div class="kpi-label">Receita Total</div>
      <div class="kpi-value">R$ ${data.totals.revenue.toLocaleString("pt-BR", {
        maximumFractionDigits: 2,
      })}</div>
      <div class="kpi-subtitle">${data.totals.sales} vendas</div>
    </div>

    <div class="kpi-card">
      <div class="kpi-label">Lucro Total</div>
      <div class="kpi-value">R$ ${data.totals.profit.toLocaleString("pt-BR", {
        maximumFractionDigits: 2,
      })}</div>
      <div class="kpi-subtitle">Margem: ${data.metrics.profitMargin.toFixed(1)}%</div>
    </div>

    <div class="kpi-card">
      <div class="kpi-label">Comissão</div>
      <div class="kpi-value">R$ ${data.totals.commission.toLocaleString("pt-BR", {
        maximumFractionDigits: 2,
      })}</div>
      <div class="kpi-subtitle">Lucro/Venda: R$ ${data.metrics.profitPerSale.toFixed(2)}</div>
    </div>

    <div class="kpi-card">
      <div class="kpi-label">Ticket Médio</div>
      <div class="kpi-value">R$ ${data.metrics.averageTicket.toLocaleString("pt-BR", {
        maximumFractionDigits: 2,
      })}</div>
      <div class="kpi-subtitle">Conversão: ${data.metrics.conversionRate.toFixed(1)}%</div>
    </div>
  </div>

  <h2 style="font-size: 18px; margin: 30px 0 20px; color: #1f2937;">Vendas Detalhadas</h2>
  <table>
    <thead>
      <tr>
        <th>Produto</th>
        <th class="text-right">Valor</th>
        <th class="text-right">Lucro</th>
        <th class="text-right">Comissão</th>
        <th>Fonte</th>
        <th>Status</th>
        <th>Data</th>
      </tr>
    </thead>
    <tbody>
      ${data.sales
        .map(
          (sale) => `
        <tr>
          <td>${sale.productName || "Sem nome"}</td>
          <td class="text-right">R$ ${Number(sale.amount).toLocaleString("pt-BR", {
            maximumFractionDigits: 2,
          })}</td>
          <td class="text-right">${sale.profit ? `R$ ${Number(sale.profit).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}` : "—"}</td>
          <td class="text-right">${sale.commission ? `R$ ${Number(sale.commission).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}` : "—"}</td>
          <td>${sale.source}</td>
          <td>
            <span class="status-${sale.paymentStatus}">
              ${sale.paymentStatus === "completed" ? "✅ Concluído" : sale.paymentStatus === "pending" ? "⏳ Pendente" : sale.paymentStatus === "failed" ? "❌ Falhou" : "🚫 Cancelado"}
            </span>
          </td>
          <td>${new Date(sale.createdAt).toLocaleDateString("pt-BR")}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>

  <div class="footer">
    <p>Relatório gerado em ${today}</p>
    <p>HERGÉ Agency - Plataforma de Gestão de Leads e Vendas</p>
  </div>
</body>
</html>
  `;
}

/**
 * Gerar arquivo Excel (base64)
 * Nota: Para produção, usar biblioteca como exceljs
 */
export function generateExcel(data: ReportData): string {
  const csv = generateCSV(data);
  // Simples conversão CSV para base64
  // Em produção, usar biblioteca exceljs/xlsx para formato real
  return Buffer.from(csv).toString("base64");
}
