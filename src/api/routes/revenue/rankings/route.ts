import { NextRequest, NextResponse } from 'next/server';
import { RankingService } from '@/services/revenue/ranking.service';
import { EventBus } from '@/core/events/event-bus';
import { Logger } from '@/lib/logger';
import { handleApiError, ApiError, validateCompanyId } from '@/api/middleware/error-handler';

const rankingService = new RankingService(new EventBus(), new Logger());

export async function GET(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get('companyId');
    const type = req.nextUrl.searchParams.get('type');
    const metric = req.nextUrl.searchParams.get('metric') || 'revenue';
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10');

    validateCompanyId(companyId);

    switch (type) {
      case 'campaigns':
        return NextResponse.json(
          await rankingService.rankCampaigns(companyId, metric as any, limit)
        );
      case 'attendants':
        return NextResponse.json(
          await rankingService.rankAttendants(companyId, metric as any, limit)
        );
      case 'products':
        return NextResponse.json(
          await rankingService.rankProducts(companyId, metric as any, limit)
        );
      case 'channels':
        return NextResponse.json(
          await rankingService.rankChannels(companyId, metric as any, limit)
        );
      default:
        throw new ApiError(400, 'Invalid type. Use: campaigns, attendants, products, channels');
    }
  } catch (error) {
    return handleApiError(error);
  }
}
