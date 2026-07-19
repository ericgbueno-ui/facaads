import { NextRequest, NextResponse } from 'next/server';
import { RevenueService } from '@/services/revenue/revenue.service';
import { EventBus } from '@/core/events/event-bus';
import { Logger } from '@/lib/logger';
import { handleApiError, ApiError, validateCompanyId } from '@/api/middleware/error-handler';

const revenueService = new RevenueService(new EventBus(), new Logger());

export async function GET(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get('companyId');
    const metricType = req.nextUrl.searchParams.get('metric');
    const startDate = req.nextUrl.searchParams.get('startDate');
    const endDate = req.nextUrl.searchParams.get('endDate');

    validateCompanyId(companyId);

    const period = {
      startDate: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: endDate ? new Date(endDate) : new Date(),
    };

    if (metricType) {
      const metric = metricType.toLowerCase();
      switch (metric) {
        case 'roas':
          return NextResponse.json(await revenueService.calculateROAS(companyId, period));
        case 'roi':
          return NextResponse.json(await revenueService.calculateROI(companyId, period));
        case 'cac':
          return NextResponse.json(await revenueService.calculateCAC(companyId, period));
        case 'cpa':
          return NextResponse.json(await revenueService.calculateCPA(companyId, period));
        case 'ltv':
          return NextResponse.json(await revenueService.calculateLTV(companyId, period));
        case 'margin':
          return NextResponse.json(await revenueService.calculateMargin(companyId, period));
        case 'conversion':
          return NextResponse.json(await revenueService.calculateConversionRate(companyId, period));
        case 'avgticket':
          return NextResponse.json(await revenueService.calculateAvgTicket(companyId, period));
        default:
          throw new ApiError(400, `Unknown metric: ${metric}`);
      }
    }

    // Retorna todos os KPIs em paralelo
    const allKPIs = await revenueService.calculateAllKPIs(companyId, period);
    return NextResponse.json(allKPIs);
  } catch (error) {
    return handleApiError(error);
  }
}
