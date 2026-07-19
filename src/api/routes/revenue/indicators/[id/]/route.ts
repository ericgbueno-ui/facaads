import { NextRequest, NextResponse } from 'next/server';
import { IndicatorService } from '@/services/revenue/indicator.service';
import { EventBus } from '@/core/events/event-bus';
import { Logger } from '@/lib/logger';
import { handleApiError, ApiError, validateCompanyId } from '@/api/middleware/error-handler';

const indicatorService = new IndicatorService(new EventBus(), new Logger());

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = req.nextUrl.searchParams.get('companyId');
    validateCompanyId(companyId);

    const indicator = await indicatorService.getIndicator(params.id, companyId);
    if (!indicator) throw new ApiError(404, 'Indicator not found');

    return NextResponse.json(indicator);
  } catch (error) {
    return handleApiError(error);
  }
}
