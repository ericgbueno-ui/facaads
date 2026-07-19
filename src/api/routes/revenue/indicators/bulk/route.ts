import { NextRequest, NextResponse } from 'next/server';
import { IndicatorService } from '@/services/revenue/indicator.service';
import { EventBus } from '@/core/events/event-bus';
import { Logger } from '@/lib/logger';
import { handleApiError, ApiError, validateCompanyId } from '@/api/middleware/error-handler';
import { Decimal } from '@prisma/client/runtime/library';

const indicatorService = new IndicatorService(new EventBus(), new Logger());

export async function POST(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get('companyId');
    const body = await req.json();

    validateCompanyId(companyId);

    if (body.action === 'bulk-store') {
      const indicators = body.indicators.map((ind: any) => ({
        companyId,
        date: new Date(ind.date),
        totalRevenue: new Decimal(ind.totalRevenue),
        totalCost: new Decimal(ind.totalCost),
        totalProfit: new Decimal(ind.totalProfit),
        roas: ind.roas,
        roi: ind.roi,
        cac: ind.cac,
        margin: ind.margin,
        campaignId: ind.campaignId,
        channel: ind.channel,
      }));

      const result = await indicatorService.bulkStoreIndicators(indicators);
      return NextResponse.json(result, { status: 201 });
    }

    if (body.action === 'detect-trends') {
      const trends = await indicatorService.detectTrends(
        companyId,
        new Date(body.startDate || Date.now() - 90 * 24 * 60 * 60 * 1000),
        new Date(body.endDate || Date.now())
      );
      return NextResponse.json(trends);
    }

    if (body.action === 'invalidate-cache') {
      await indicatorService.invalidateCache(companyId);
      return NextResponse.json({ success: true });
    }

    throw new ApiError(400, 'Invalid action');
  } catch (error) {
    return handleApiError(error);
  }
}
