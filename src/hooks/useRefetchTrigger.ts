import { useCallback, useState } from "react";

export function useRefetchTrigger(
  enabled: boolean,
  onBeforeRefetch: () => void,
): { refetchTrigger: number; refetch: () => void } {
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const refetch = useCallback(() => {
    if (!enabled) {
      return;
    }
    onBeforeRefetch();
    setRefetchTrigger((current) => current + 1);
  }, [enabled, onBeforeRefetch]);

  return { refetchTrigger, refetch };
}
