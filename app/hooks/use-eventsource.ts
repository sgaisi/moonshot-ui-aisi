import { useEffect, useState, useRef, useCallback } from 'react';

function isObject(object: unknown): boolean {
  return object != null && typeof object === 'object';
}

export function useEventSource<T, E extends string>(
  url: string,
  eventType: E
): [T | null, () => void] {
  const [data, setData] = useState<T | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const closeEventSource = useCallback(() => {
    console.log('Closing EventSource');
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  useEffect(() => {
    eventSourceRef.current = new EventSource(url);

    eventSourceRef.current.onopen = (event) => {
      console.log('EVENTSOURCE Open', event);
    };

    eventSourceRef.current.addEventListener(eventType, (event) => {
      try {
        const parsedData: T = JSON.parse(event.data);

        // Always update with the new data
        setData(parsedData);
      } catch (error) {
        console.error('Failed to parse event data:', error, event.data);
      }
    });

    eventSourceRef.current.onerror = (error) => {
      console.error('EventSource failed:', error);
      closeEventSource();
    };

    // Cleanup function to close EventSource on unmount
    return () => {
      console.log('Cleaning up EventSource on unmount');
      closeEventSource();
    };
  }, [url, eventType, closeEventSource]);

  return [data, closeEventSource];
}
