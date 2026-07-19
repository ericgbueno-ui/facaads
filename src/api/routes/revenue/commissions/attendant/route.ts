import { NextRequest, NextResponse } from 'next/server';
import { CommissionService } from '@/services/revenue/commission.service';
import { EventBus } from '@/core/events/event-bus';
import { Logger } from '@/lib/logger';
import { handleApiError, ApiError, validateCompanyId } from '@/api/middleware/error-handler';

const commissionService = new CommissionService(new EventBus(), new Logger());

export async function GET(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get('companyId');
    const attendantId = req.nextUrl.searchParams.get('attendantId');
    const startDate = req.nextUrl.searchParams.get('startDate');
    const endDate = req.nextUrl.searchParams.get('endDate');

    validateCompanyId(companyId);

    if (attendantId && startDate && endDate) {
      const sumByPeriod = await commissionService.getSumByPeriod(
        companyId,
        new Date(startDate),
        new Date(endDate)
      );
      return NextResponse.json(sumByPeriod);
    }

    if (attendantId) {
      const sum = await commissionService.getSumByAttendant(companyId, attendantId);
      return NextResponse.json(sum);
    }

    throw new ApiError(400, 'Missing attendantId');
  } catch (error) {
    return handleApiError(error);
  }
}
