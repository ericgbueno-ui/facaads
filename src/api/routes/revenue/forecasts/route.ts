import { NextRequest, NextResponse } from 'next/server';
import { ForecastService } from '@/services/revenue/forecast.service';
import { EventBus } from '@/core/events/event-bus';
import { Logger } from '@/lib/logger';
import { handleApiError, ApiError, validateCompanyId } from '@/api/middleware/error-handler';

const forecastService = new ForecastService(new EventBus(), new Logger());

export async function POST(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get('companyId');
    const body = await req.json();

    validateCompanyId(companyId);

    const type = body.type || 'single';

    if (type === 'monthly') {
      const forecasts = await forecastService.generateMonthlyForecast(
        companyId,
        new Date(body.startDate || Date.now())
      );
      return NextResponse.json(forecasts, { status: 201 });
    }

    const forecast = await forecastService.generateForecast(
      companyId,
      new Date(body.forecastDate || Date.now()),
      body.confidence || 75
    );

    return NextResponse.json(forecast, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get('companyId');
    const forecastId = req.nextUrl.searchParams.get('forecastId');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '12');

    validateCompanyId(companyId);

    if (forecastId) {
      const validation = await forecastService.validateForecast(forecastId);
      return NextResponse.json(validation);
    }

    const forecasts = await forecastService.getForecasts(companyId, limit);
    return NextResponse.json(forecasts);
  } catch (error) {
    return handleApiError(error);
  }
}
