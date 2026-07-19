import { NextRequest, NextResponse } from 'next/server';
import { SaleService } from '@/services/revenue/sale.service';
import { EventBus } from '@/core/events/event-bus';
import { Logger } from '@/lib/logger';
import { handleApiError, ApiError, validateCompanyId } from '@/api/middleware/error-handler';

const saleService = new SaleService(new EventBus(), new Logger());

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyId, saleId, action } = body;

    validateCompanyId(companyId);
    if (!saleId || !action) throw new ApiError(400, 'Missing saleId or action');

    switch (action) {
      case 'complete':
        return NextResponse.json(await saleService.completeSale(saleId, companyId));
      case 'lose':
        return NextResponse.json(await saleService.loseSale(saleId, companyId, body.reason));
      case 'cancel':
        return NextResponse.json(await saleService.cancelSale(saleId, companyId));
      default:
        throw new ApiError(400, 'Invalid action');
    }
  } catch (error) {
    return handleApiError(error);
  }
}
