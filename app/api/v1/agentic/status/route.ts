import { appEventBus } from '@/app/api/eventbus';
import { AppEventTypes } from '@/app/types/enums';
import config from '@/moonshot.config';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = (await request.json()) as TestStatus;
  console.debug('Agentic webhook callback invoked', {
    current_runner_id: body.current_runner_id,
    current_progress: body.current_progress,
    current_status: body.current_status,
  });
  // Emit AGENTIC_UPDATE event instead of BENCHMARK_UPDATE
  appEventBus.emit(AppEventTypes.AGENTIC_UPDATE, body);
  return new Response(
    JSON.stringify({ msg: 'Agentic updates sent to SSE writer' })
  );
}

export async function GET() {
  const response = await fetch(
    `${config.webAPI.hostURL}${config.webAPI.basePathAgentic}/status`,
    {
      method: 'GET',
    }
  );
  return response;
}
