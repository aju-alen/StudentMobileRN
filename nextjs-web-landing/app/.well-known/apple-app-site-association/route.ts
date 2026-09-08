import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json(
    {
      applinks: {
        details: [
          {
            appIDs: ['46LHZT8BN9.com.rise.coachacadem'],
            components: [{ '/': '/teacher/*' }],
            paths: ['/teacher/*'],
          },
        ],
      },
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}
