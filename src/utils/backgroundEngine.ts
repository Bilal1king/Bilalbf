/**
 * Background & Screen Wake Lock Engine for Bilal King
 * Enables seamless hands-free operation and keeps audio/mic contexts alive
 * when running on mobile devices or when app is minimized.
 */

let wakeLockSentinel: any = null;
let backgroundAudioContext: AudioContext | null = null;
let silentOscillator: OscillatorNode | null = null;
let silentGainNode: GainNode | null = null;

/**
 * Request Screen Wake Lock so mobile screen stays awake during hands-free sessions
 */
export async function requestScreenWakeLock(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
    return false;
  }

  try {
    if (wakeLockSentinel && !wakeLockSentinel.released) {
      return true;
    }
    wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
    wakeLockSentinel.addEventListener('release', () => {
      wakeLockSentinel = null;
    });
    return true;
  } catch (err) {
    // Wake lock might be denied due to low battery or permissions
    return false;
  }
}

/**
 * Release screen wake lock
 */
export async function releaseScreenWakeLock() {
  if (wakeLockSentinel) {
    try {
      await wakeLockSentinel.release();
    } catch (e) {
      // Ignore
    }
    wakeLockSentinel = null;
  }
}

/**
 * Starts an inaudible background audio keep-alive loop.
 * Mobile operating systems (Chrome Android, iOS Safari) throttle background JS
 * and kill microphone listeners unless an active Web Audio context with an output
 * is running. This creates an inaudible carrier (gain 0.00001) that keeps the
 * event loop, audio pipeline, and speech recognition alive.
 */
export function startBackgroundAudioKeepAlive() {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!backgroundAudioContext) {
      backgroundAudioContext = new AudioContextClass();
    }

    if (backgroundAudioContext.state === 'suspended') {
      backgroundAudioContext.resume().catch(() => {});
    }

    // If already running, do nothing
    if (silentOscillator) return;

    silentGainNode = backgroundAudioContext.createGain();
    // Inaudible gain (practically silent, but keeps audio stream active)
    silentGainNode.gain.setValueAtTime(0.00001, backgroundAudioContext.currentTime);
    silentGainNode.connect(backgroundAudioContext.destination);

    silentOscillator = backgroundAudioContext.createOscillator();
    silentOscillator.frequency.setValueAtTime(440, backgroundAudioContext.currentTime);
    silentOscillator.connect(silentGainNode);
    silentOscillator.start();

    // Register MediaSession metadata so mobile notification bar shows Bilal King Active
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'Bilal King - Hands-Free Voice Mode',
        artist: 'JARVIS AI Assistant',
        album: 'Continuous Mobile Listener',
      });

      navigator.mediaSession.playbackState = 'playing';

      navigator.mediaSession.setActionHandler('pause', () => {
        // Handled by app
      });
      navigator.mediaSession.setActionHandler('play', () => {
        if (backgroundAudioContext && backgroundAudioContext.state === 'suspended') {
          backgroundAudioContext.resume();
        }
      });
    }
  } catch (err) {
    console.warn('Background audio keep-alive not supported:', err);
  }
}

/**
 * Stops background audio keep alive
 */
export function stopBackgroundAudioKeepAlive() {
  try {
    if (silentOscillator) {
      silentOscillator.stop();
      silentOscillator.disconnect();
      silentOscillator = null;
    }
    if (silentGainNode) {
      silentGainNode.disconnect();
      silentGainNode = null;
    }
    if (backgroundAudioContext) {
      backgroundAudioContext.close().catch(() => {});
      backgroundAudioContext = null;
    }

    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'none';
    }
  } catch (err) {
    // Ignore
  }
}

/**
 * Checks battery status via Battery Status API
 */
export async function getDeviceBatteryInfo(): Promise<{
  level: number;
  charging: boolean;
  supported: boolean;
}> {
  if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
    try {
      const battery = await (navigator as any).getBattery();
      return {
        level: Math.round(battery.level * 100),
        charging: Boolean(battery.charging),
        supported: true,
      };
    } catch (e) {
      // Ignore
    }
  }
  return { level: 100, charging: false, supported: false };
}

/**
 * Controls device torch/flashlight if supported by camera hardware
 */
let torchMediaStream: MediaStream | null = null;
let torchTrack: MediaStreamTrack | null = null;

export async function toggleDeviceTorch(desiredState?: boolean): Promise<{
  success: boolean;
  isOn: boolean;
  message: string;
}> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return { success: false, isOn: false, message: 'Torch hardware not accessible on this device' };
  }

  // If turning off
  if (desiredState === false || (desiredState === undefined && torchTrack)) {
    if (torchTrack) {
      try {
        await (torchTrack as any).applyConstraints({ advanced: [{ torch: false }] });
        torchTrack.stop();
      } catch (e) {}
      torchTrack = null;
    }
    if (torchMediaStream) {
      torchMediaStream.getTracks().forEach((t) => t.stop());
      torchMediaStream = null;
    }
    return { success: true, isOn: false, message: 'Torch band ho gayi hai' };
  }

  // If turning on
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
      },
    });

    const track = stream.getVideoTracks()[0];
    const capabilities = (track as any).getCapabilities ? (track as any).getCapabilities() : {};

    if (!capabilities.torch) {
      track.stop();
      return {
        success: false,
        isOn: false,
        message: 'Device camera torch feature is not supported on this browser hardware',
      };
    }

    await (track as any).applyConstraints({
      advanced: [{ torch: true }],
    });

    torchMediaStream = stream;
    torchTrack = track;
    return { success: true, isOn: true, message: 'Torch on ho gayi hai' };
  } catch (err: any) {
    return {
      success: false,
      isOn: false,
      message: 'Camera permission denied ya torch hardware uplabdh nahi hai',
    };
  }
}
