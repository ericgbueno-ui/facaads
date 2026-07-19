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

    const indicator = await indicatorService.storeIndicator({
      companyId,
      date: new Date(body.date || Date.now()),
      totalRevenue: new Decimal(body.totalRevenue),
      totalCost: new Decimal(body.totalCost),
      totalProfit: new Decimal(body.totalProfit),
      roas: body.roas,
      roi: body.roi,
      cac: body.cac,
      margin: body.margin,
      campaignId: body.campaignId,
      channel: body.channel,
    });

    return NextResponse.json(indicator, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get('companyId');
    const period = req.nextUrl.searchParams.get('period');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '30');

    validateCompanyId(companyId);

    if (period === 'today') {
      const today = await indicatorService.getTodayIndicator(companyId);
      return NextResponse.json(today ? [today] : []);
    }

    if (period === 'month') {
      const month = await indicatorService.getCurrentMonthIndicator(companyId);
      return NextResponse.json(month ? [month] : []);
    }

    const recent = await indicatorService.getRecent(companyId, limit);
    return NextResponse.json(recent);
  } catch (error) {
    return handleApiError(error);
  }
}
