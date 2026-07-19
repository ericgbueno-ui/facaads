import { NextRequest, NextResponse } from 'next/server';
import { GoalService } from '@/services/revenue/goal.service';
import { EventBus } from '@/core/events/event-bus';
import { Logger } from '@/lib/logger';
import { handleApiError, ApiError, validateCompanyId } from '@/api/middleware/error-handler';

const goalService = new GoalService(new EventBus(), new Logger());

export async function POST(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get('companyId');
    const body = await req.json();

    validateCompanyId(companyId);

    if (!body.metric || !body.targetValue || !body.period || !body.endDate) {
      throw new ApiError(400, 'Missing required fields: metric, targetValue, period, endDate');
    }

    const goal = await goalService.createGoal(
      companyId,
      body.metric,
      body.targetValue,
      body.period,
      new Date(body.endDate)
    );

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get('companyId');
    const status = req.nextUrl.searchParams.get('status');
    const action = req.nextUrl.searchParams.get('action');

    validateCompanyId(companyId);

    if (action === 'progress') {
      const progress = await goalService.getProgress(companyId);
      return NextResponse.json(progress);
    }

    const goals = await goalService.listGoals(companyId, status as any);
    return NextResponse.json(goals);
  } catch (error) {
    return handleApiError(error);
  }
}
