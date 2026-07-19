import { NextRequest, NextResponse } from 'next/server';
import { LossService } from '@/services/revenue/loss.service';
import { EventBus } from '@/core/events/event-bus';
import { Logger } from '@/lib/logger';
import { handleApiError, ApiError, validateCompanyId } from '@/api/middleware/error-handler';

const lossService = new LossService(new EventBus(), new Logger());

export async function POST(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get('companyId');
    const body = await req.json();

    validateCompanyId(companyId);

    const reason = await lossService.createReason({
      companyId,
      reason: body.reason,
      description: body.description,
      displayOrder: body.displayOrder || 0,
    });

    return NextResponse.json(reason, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get('companyId');
    const action = req.nextUrl.searchParams.get('action');
    const startDate = req.nextUrl.searchParams.get('startDate');
    const endDate = req.nextUrl.searchParams.get('endDate');

    validateCompanyId(companyId);

    if (action === 'analyze' && startDate && endDate) {
      const analysis = await lossService.analyzeLosses(
        companyId,
        new Date(startDate),
        new Date(endDate)
      );
      return NextResponse.json(analysis);
    }

    if (action === 'anomalies' && startDate && endDate) {
      const alerts = await lossService.detectAnomalies(
        companyId,
        new Date(startDate),
        new Date(endDate),
        new Date(new Date(startDate).getTime() - 30 * 24 * 60 * 60 * 1000),
        new Date(new Date(endDate).getTime() - 30 * 24 * 60 * 60 * 1000)
      );
      return NextResponse.json(alerts);
    }

    const reasons = await lossService.getActiveReasons(companyId);
    return NextResponse.json(reasons);
  } catch (error) {
    return handleApiError(error);
  }
}
