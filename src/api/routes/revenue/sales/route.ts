import { NextRequest, NextResponse } from 'next/server';
import { SaleService } from '@/services/revenue/sale.service';
import { EventBus } from '@/core/events/event-bus';
import { Logger } from '@/lib/logger';
import { handleApiError, ApiError, validateCompanyId } from '@/api/middleware/error-handler';
import { Decimal } from '@prisma/client/runtime/library';

const saleService = new SaleService(new EventBus(), new Logger());

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyId, totalAmount, status, leadId, campaignId, attendantId, products } = body;

    validateCompanyId(companyId);

    if (!totalAmount || !status) {
      throw new ApiError(400, 'Missing required fields: totalAmount, status');
    }

    const sale = await saleService.createSale({
      companyId,
      totalAmount: new Decimal(totalAmount),
      status,
      leadId,
      campaignId,
      attendantId,
      attendantName: body.attendantName,
      products,
    });

    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get('companyId');
    const status = req.nextUrl.searchParams.get('status');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50');

    validateCompanyId(companyId);

    const sales = await saleService.listSales(companyId, { status, limit });
    return NextResponse.json(sales);
  } catch (error) {
    return handleApiError(error);
  }
}
