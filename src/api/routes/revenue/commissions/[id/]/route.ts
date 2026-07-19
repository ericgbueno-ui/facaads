import { NextRequest, NextResponse } from 'next/server';
import { CommissionService } from '@/services/revenue/commission.service';
import { EventBus } from '@/core/events/event-bus';
import { Logger } from '@/lib/logger';
import { handleApiError, ApiError, validateCompanyId } from '@/api/middleware/error-handler';

const commissionService = new CommissionService(new EventBus(), new Logger());

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = req.nextUrl.searchParams.get('companyId');
    validateCompanyId(companyId);

    const commission = await commissionService.getCommission(params.id);
    if (!commission || commission.companyId !== companyId) {
      throw new ApiError(404, 'Commission not found');
    }

    return NextResponse.json(commission);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = req.nextUrl.searchParams.get('companyId');
    const body = await req.json();

    validateCompanyId(companyId);

    if (body.action === 'mark-calculated') {
      return NextResponse.json(await commissionService.markAsCalculated(params.id));
    }

    if (body.action === 'mark-paid') {
      return NextResponse.json(await commissionService.markAsPaid(params.id));
    }

    throw new ApiError(400, 'Invalid action');
  } catch (error) {
    return handleApiError(error);
  }
}
