import { NextRequest, NextResponse } from 'next/server';
import { LossService } from '@/services/revenue/loss.service';
import { EventBus } from '@/core/events/event-bus';
import { Logger } from '@/lib/logger';
import { handleApiError, ApiError, validateCompanyId } from '@/api/middleware/error-handler';

const lossService = new LossService(new EventBus(), new Logger());

export async function GET(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get('companyId');
    const metric = req.nextUrl.searchParams.get('metric');
    const startDate = req.nextUrl.searchParams.get('startDate');
    const endDate = req.nextUrl.searchParams.get('endDate');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '5');

    validateCompanyId(companyId);

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    switch (metric) {
      case 'rate':
        return NextResponse.json({
          lossRate: await lossService.getLossRate(companyId, start, end),
        });
      case 'total-value':
        return NextResponse.json({
          totalValueLost: await lossService.getTotalValueLost(companyId, start, end),
        });
      case 'top-reasons':
        return NextResponse.json(await lossService.getTopReasons(companyId, limit));
      default:
        throw new ApiError(400, 'Invalid metric');
    }
  } catch (error) {
    return handleApiError(error);
  }
}
