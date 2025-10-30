import EventEmitter from 'events';
import { NextResponse } from 'next/server';
import { RedTeamEvents, SystemEvents } from '@/app/api/types';
import { AppEventTypes } from '@/app/types/enums';
import { Writer, getSSEWriter } from './sse_writer';
export const dynamic = 'force-dynamic';

/*
artEventBus is instantiated twice instead of sharing the same intsance in dev mode!
only test this using prod build (npm run build && npm start)
*/

const MAX_LISTENERS = 8;

const artEventBus = new EventEmitter();
artEventBus.setMaxListeners(MAX_LISTENERS);
console.log('ART EventBus limits: ', artEventBus.getMaxListeners());

export async function POST(request: Request) {
  const body = (await request.json()) as ArtStatus;
  console.debug('ART Webhook callback invoked', {
    current_runner_id: body.current_runner_id,
    current_status: body.current_status,
  });

  artEventBus.emit(AppEventTypes.REDTEAM_UPDATE, body);
  return new Response(
    JSON.stringify({ msg: 'Updates sent to ART SSE writer' })
  );
}

let heartbeatTimers: NodeJS.Timeout[] = [];
let artEmitters: EventEmitter[] = [];
const cleanup = () => {
  heartbeatTimers.forEach((timer) => clearInterval(timer));
  heartbeatTimers = [];
  artEmitters.forEach((emitter) => emitter.removeAllListeners());
  artEmitters = [];
  artEventBus.removeAllListeners(AppEventTypes.REDTEAM_UPDATE);
};

process.on('exit', cleanup);
process.on('SIGINT', () => {
  cleanup();
  process.exit();
});

export async function GET(request: Request) {
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();
  const sseWriter: Writer | undefined = getSSEWriter(writer, encoder);

  let connectionClosed = false;

  // Detect when client closes connection
  request.signal.addEventListener('abort', () => {
    console.log('Client disconnected from ART SSE stream');
    connectionClosed = true;
    emitter.removeAllListeners(AppEventTypes.REDTEAM_UPDATE);
    const index = artEmitters.indexOf(emitter);
    if (index > -1) {
      artEmitters.splice(index, 1);
    }
    writer.close().catch((err) => {
      console.error('Error closing writer:', err);
    });
  });

  function handleRedTeamUpdate(data: ArtStatus) {
    // Check if connection is still alive
    if (connectionClosed) {
      return;
    }

    console.debug('ART Data received from webhook', {
      runner_id: data.current_runner_id,
      current_status: data.current_status,
    });
    if (!sseWriter) {
      console.error('SSE writer not initialized');
      return;
    }
    try {
      if ('current_runner_id' in data) {
        sseWriter.update({
          data,
          event: AppEventTypes.REDTEAM_UPDATE,
        });
      }
    } catch (error) {
      console.error('Error handling REDTEAM_UPDATE event', error);
      // Immediately clean up on write error
      connectionClosed = true;
      emitter.removeAllListeners(AppEventTypes.REDTEAM_UPDATE);
      const index = artEmitters.indexOf(emitter);
      if (index > -1) {
        artEmitters.splice(index, 1);
      }
    }
  }

  const totalListeners = artEventBus.listenerCount(
    AppEventTypes.REDTEAM_UPDATE
  );
  if (totalListeners === artEventBus.getMaxListeners() - 1) {
    artEmitters[0].removeAllListeners(AppEventTypes.REDTEAM_UPDATE);
    artEmitters.shift();
  }
  if (totalListeners === artEventBus.getMaxListeners()) {
    console.log(
      'Max number of listeners reached for: ',
      AppEventTypes.REDTEAM_UPDATE
    );
    return new NextResponse('Max number of listeners reached', { status: 429 });
  }

  const emitter = artEventBus.on(
    AppEventTypes.REDTEAM_UPDATE,
    (data: ArtStatus) => {
      handleRedTeamUpdate(data);
    }
  );
  artEmitters.push(emitter);

  // Heartbeat mechanism
  // const heartbeatInterval = setInterval(() => {
  //   try {
  //     console.log('Sending ART SSE heartbeat');
  //     console.log(
  //       'Number of listeners on artEmitters: ',
  //       artEventBus.listenerCount(AppEventTypes.REDTEAM_UPDATE)
  //     );
  //     console.log('art heartbeatTimers: ', heartbeatTimers.length);
  //     writer.write(encoder.encode(': \n\n')).catch(() => {
  //         console.error(
  //           'Error writing heartbeat to SSE ART stream. This is expected if SSE connection was closed. Cleaning up SSE ART resources.'
  //         );
  //         emitter.removeAllListeners(AppEventTypes.REDTEAM_UPDATE);
  //         clearInterval(heartbeatInterval);
  //         const index = heartbeatTimers.indexOf(heartbeatInterval);
  //         if (index > -1) {
  //           heartbeatTimers.splice(index, 1);
  //         }
  //     });
  //   } catch (error) {
  //     const errWIthMsg = toErrorWithMessage(error);
  //     console.error('Error sending ART SSE heartbeat', errWIthMsg);
  //   }
  // }, 10000);

  // heartbeatTimers.push(heartbeatInterval);

  const eventStream = async (notifier: RedTeamEvents | SystemEvents) => {
    (notifier as SystemEvents).update({
      data: { msg: 'SSE RT init done' },
      event: AppEventTypes.SYSTEM_UPDATE,
    });
  };

  eventStream(sseWriter);

  return new NextResponse(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache, no-transform',
    },
  });
}
