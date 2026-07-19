import { NextRequest, NextResponse } from 'next/server';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      { error: error.message, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { error: 'Unknown error', code: 'UNKNOWN' },
    { status: 500 }
  );
}

export function validateCompanyId(companyId: unknown): asserts companyId is string {
  if (!companyId || typeof companyId !== 'string') {
    throw new ApiError(400, 'Missing or invalid companyId', 'INVALID_COMPANY_ID');
  }
}

export function validateRequestBody<T>(data: unknown, schema: (v: unknown) => v is T): T {
  if (!schema(data)) {
    throw new ApiError(400, 'Invalid request body', 'INVALID_REQUEST');
  }
  return data;
}
