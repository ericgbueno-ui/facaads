import { NextRequest, NextResponse } from 'next/server';
import { RankingService } from '@/services/revenue/ranking.service';
import { EventBus } from '@/core/events/event-bus';
import { Logger } from '@/lib/logger';
import { handleApiError, ApiError, validateCompanyId } from '@/api/middleware/error-handler';

const rankingService = new RankingService(new EventBus(), new Logger());

export async function GET(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get('companyId');
    const metric = req.nextUrl.searchParams.get('metric') || 'revenue';

    validateCompanyId(companyId);

    const score = await rankingService.calculateScore(companyId, metric as any);
    return NextResponse.json({ score, metric });
  } catch (error) {
    return handleApiError(error);
  }
}
