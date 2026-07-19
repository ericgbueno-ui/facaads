import { NextRequest, NextResponse } from 'next/server';
import { CommissionService } from '@/services/revenue/commission.service';
import { EventBus } from '@/core/events/event-bus';
import { Logger } from '@/lib/logger';
import { handleApiError, ApiError, validateCompanyId } from '@/api/middleware/error-handler';
import { Decimal } from '@prisma/client/runtime/library';

const commissionService = new CommissionService(new EventBus(), new Logger());

export async function POST(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get('companyId');
    const body = await req.json();

    validateCompanyId(companyId);

    const commission = await commissionService.createCommission({
      companyId,
      saleId: body.saleId,
      attendantId: body.attendantId,
      attendantName: body.attendantName,
      amount: new Decimal(body.amount),
      percentage: body.percentage,
      status: body.status || 'PENDENTE',
    });

    return NextResponse.json(commission, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get('companyId');
    const attendantId = req.nextUrl.searchParams.get('attendantId');
    const status = req.nextUrl.searchParams.get('status');

    validateCompanyId(companyId);

    if (attendantId) {
      const commissions = await commissionService.getByAttendant(companyId, attendantId);
      return NextResponse.json(commissions);
    }

    if (status) {
      const pending = await commissionService.getPending(companyId);
      return NextResponse.json(pending);
    }

    const summary = await commissionService.getSummary(companyId);
    return NextResponse.json(summary);
  } catch (error) {
    return handleApiError(error);
  }
}
