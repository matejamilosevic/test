import { cleanupExpiredHolds } from "../services/reservation_ledger";

export const CHECKOUT_HOLD_CLEANUP_JOB_NAME = "checkout-hold-cleanup";
export const CHECKOUT_HOLD_CLEANUP_INTERVAL_MS = 60_000;

let cleanupTimer: ReturnType<typeof setInterval> | undefined;

export function runCheckoutHoldCleanupOnce(nowMs: number = Date.now()): number {
  return cleanupExpiredHolds(nowMs);
}

export function startCheckoutHoldCleanupJob(): void {
  if (cleanupTimer) {
    return;
  }
  cleanupTimer = setInterval(() => {
    runCheckoutHoldCleanupOnce();
  }, CHECKOUT_HOLD_CLEANUP_INTERVAL_MS);
  cleanupTimer.unref?.();
}

export function stopCheckoutHoldCleanupJob(): void {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = undefined;
  }
}
