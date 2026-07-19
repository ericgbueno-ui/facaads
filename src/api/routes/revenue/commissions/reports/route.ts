import { NextRequest, NextResponse } from 'next/server';
import { CommissionService } from '@/services/revenue/commission.service';
import { EventBus } from '@/core/events/event-bus';
import { Logger } from '@/lib/logger';
import { handleApiError, ApiError, validateCompanyId } from '@/api/middleware/error-handler';

const commissionService = new CommissionService(new EventBus(), new Logger());

export async function GET(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get('companyId');
    const report = req.nextUrl.searchParams.get('report');
    const startDate = req.nextUrl.searchParams.get('startDate');
    const endDate = req.nextUrl.searchParams.get('endDate');

    validateCompanyId(companyId);

    switch (report) {
      case 'summary':
        return NextResponse.json(await commissionService.getSummary(companyId));
      case 'top-earners':
        const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10');
        return NextResponse.json(await commissionService.getTopEarners(companyId, limit));
      case 'full':
        return NextResponse.json(
          await commissionService.generateReport(companyId, startDate, endDate)
        );
      case 'by-period':
        if (!startDate || !endDate) throw new ApiError(400, 'Missing startDate or endDate');
        return NextResponse.json(
          await commissionService.getSumByPeriod(companyId, new Date(startDate), new Date(endDate))
        );
      default:
        throw new ApiError(400, 'Invalid report type');
    }
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get('companyId');
    const body = await req.json();

    validateCompanyId(companyId);

    if (body.action === 'process-payment') {
      const result = await commissionService.processPayment(
        companyId,
        body.commissionIds || [],
        body.paymentMethod
      );
      return NextResponse.json(result, { status: 201 });
    }

    throw new ApiError(400, 'Invalid action');
  } catch (error) {
    return handleApiError(error);
  }
}
