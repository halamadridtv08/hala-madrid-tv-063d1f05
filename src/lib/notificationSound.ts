/**
 * Court carillon de notification généré à la volée (WebAudio) — aucun fichier à charger.
 */
let ctx: AudioContext | null = null;

const getContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext || (window as any).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  return ctx;
};

export const playNotificationChime = async (volume = 0.25) => {
  const audio = getContext();
  if (!audio) return;
  try {
    if (audio.state === 'suspended') await audio.resume();
  } catch {
    return;
  }

  const now = audio.currentTime;
  const master = audio.createGain();
  master.gain.value = Math.max(0, Math.min(1, volume));
  master.connect(audio.destination);

  // Deux notes douces (Do#6 puis Mi6) — court et agréable
  [
    { freq: 1108.73, start: 0, duration: 0.22 },
    { freq: 1318.51, start: 0.12, duration: 0.32 },
  ].forEach(({ freq, start, duration }) => {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, now + start);
    gain.gain.exponentialRampToValueAtTime(0.6, now + start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);
    osc.connect(gain);
    gain.connect(master);
    osc.start(now + start);
    osc.stop(now + start + duration + 0.05);
  });
};
