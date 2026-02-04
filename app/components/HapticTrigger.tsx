"use client";

/**
 * Hidden element that triggers haptic feedback on iOS 18+
 *
 * iOS doesn't support the Vibration API, but toggling a switch input
 * triggers a light haptic. This component provides that hidden input
 * which can be triggered programmatically via triggerHaptic() in lib/utils.ts
 */
export function HapticTrigger() {
  return (
    <>
      <input
        type="checkbox"
        id="haptic-checkbox"
        // @ts-expect-error - 'switch' is a non-standard attribute for iOS haptic
        switch=""
        className="hidden"
        onChange={(e) => { e.target.checked = !e.target.checked; }}
      />
      <label id="haptic-label" htmlFor="haptic-checkbox" className="hidden" />
    </>
  );
}
