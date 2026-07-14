/**
 * Smoothly ramps HTMLAudioElement.volume over `durationMs`.
 * Cancels any previous fade on the same element via shared token map.
 */

const fadeTokens = new WeakMap<HTMLAudioElement, number>();

export function fadeAudioVolume(
  audio: HTMLAudioElement,
  targetVolume: number,
  durationMs: number,
): Promise<void> {
  const target = Math.min(1, Math.max(0, targetVolume));
  const token = (fadeTokens.get(audio) ?? 0) + 1;
  fadeTokens.set(audio, token);

  if (durationMs <= 0) {
    audio.volume = target;
    return Promise.resolve();
  }

  const startVolume = audio.volume;
  const delta = target - startVolume;
  const start = performance.now();

  return new Promise((resolve) => {
    const tick = (now: number) => {
      if (fadeTokens.get(audio) !== token) {
        resolve();
        return;
      }

      const t = Math.min(1, (now - start) / durationMs);
      // Smoothstep for gentler ears
      const eased = t * t * (3 - 2 * t);
      audio.volume = startVolume + delta * eased;

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        audio.volume = target;
        resolve();
      }
    };

    requestAnimationFrame(tick);
  });
}

export function cancelAudioFade(audio: HTMLAudioElement): void {
  fadeTokens.set(audio, (fadeTokens.get(audio) ?? 0) + 1);
}
