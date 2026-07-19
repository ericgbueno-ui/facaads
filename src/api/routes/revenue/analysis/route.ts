import { NextRequest, NextResponse } from 'next/server';
import { RevenueService } from '@/services/revenue/revenue.service';
import { EventBus } from '@/core/events/event-bus';
import { Logger } from '@/lib/logger';
import { handleApiError, ApiError, validateCompanyId } from '@/api/middleware/error-handler';

const revenueService = new RevenueService(new EventBus(), new Logger());

export async function GET(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get('companyId');
    const type = req.nextUrl.searchParams.get('type');
    const startDate = req.nextUrl.searchParams.get('startDate');
    const endDate = req.nextUrl.searchParams.get('endDate');

    validateCompanyId(companyId);

    const period = {
      startDate: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: endDate ? new Date(endDate) : new Date(),
    };

    switch (type) {
      case 'compare': {
        const previousPeriod = {
          startDate: new Date(period.startDate.getTime() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(period.startDate.getTime() - 1),
        };
        return NextResponse.json(
          await revenueService.compareKPIs(companyId, period, previousPeriod)
        );
      }
      case 'trends':
        return NextResponse.json(await revenueService.detectTrends(companyId, period));
      case 'anomalies':
        return NextResponse.json(await revenueService.detectAnomalies(companyId, period));
      default:
        throw new ApiError(400, 'Invalid type: use compare, trends, or anomalies');
    }
  } catch (error) {
    return handleApiError(error);
  }
}
