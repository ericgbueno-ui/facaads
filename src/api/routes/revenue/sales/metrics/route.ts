import { NextRequest, NextResponse } from 'next/server';
import { SaleService } from '@/services/revenue/sale.service';
import { EventBus } from '@/core/events/event-bus';
import { Logger } from '@/lib/logger';
import { handleApiError, ApiError, validateCompanyId } from '@/api/middleware/error-handler';

const saleService = new SaleService(new EventBus(), new Logger());

export async function GET(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get('companyId');
    const startDate = req.nextUrl.searchParams.get('startDate');
    const endDate = req.nextUrl.searchParams.get('endDate');

    validateCompanyId(companyId);
    if (!startDate || !endDate) throw new ApiError(400, 'Missing startDate or endDate');

    const metrics = await saleService.getMetrics(companyId);
    const byDateRange = await saleService.getSalesByDateRange(
      companyId,
      new Date(startDate),
      new Date(endDate)
    );

    return NextResponse.json({
      metrics,
      byDateRange,
      count: byDateRange.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
