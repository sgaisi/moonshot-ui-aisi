import { useEffect, useState, useRef, useCallback } from 'react';

function isObject(object: unknown): boolean {
  return object != null && typeof object === 'object';
}

function isEqual(
  obj1: Record<string, unknown>,
  obj2: Record<string, unknown>
): boolean {
  const obj1Keys = Object.keys(obj1);
  const obj2Keys = Object.keys(obj2);

  if (obj1Keys.length !== obj2Keys.length) {
    return false;
  }

  for (const key of obj1Keys) {
    const val1 = obj1[key];
    const val2 = obj2[key];
    const areObjects = isObject(val1) && isObject(val2);
    if (
      (areObjects &&
        !isEqual(
          val1 as Record<string, unknown>,
          val2 as Record<string, unknown>
        )) ||
      (!areObjects && val1 !== val2)
    ) {
      return false;
    }
  }

  return true;
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
      console.log('SYSTEM-UPDATE', event);
      const parsedData: T = JSON.parse(event.data);
      if (
        data &&
        isEqual(
          data as Record<string, unknown>,
          parsedData as Record<string, unknown>
        )
      )
        return;
      setData(parsedData);
    });

    eventSourceRef.current.onerror = (error) => {
      console.error('EventSource failed:', error);
      closeEventSource();
    };

    // CRITICAL: Cleanup function to close EventSource on unmount
    return () => {
      console.log('Cleaning up EventSource on unmount');
      closeEventSource();
    };
  }, [url, eventType, closeEventSource]);

  return [data, closeEventSource];
}
