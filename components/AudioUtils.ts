
import { getAudioSettings } from '../services/audioSettings';

let sharedAudioCtx: AudioContext | null = null;
let voiceGainNode: GainNode | null = null;

export function getSharedAudioContext(): AudioContext {
  if (!sharedAudioCtx) {
    sharedAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ 
      sampleRate: 24000 
    });
    voiceGainNode = sharedAudioCtx.createGain();
    voiceGainNode.connect(sharedAudioCtx.destination);
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume();
  }
  return sharedAudioCtx;
}

export function getVoiceGainNode(): GainNode {
  const ctx = getSharedAudioContext();
  if (!voiceGainNode) {
    voiceGainNode = ctx.createGain();
    voiceGainNode.connect(ctx.destination);
  }
  updateVoiceGain();
  return voiceGainNode;
}

function updateVoiceGain() {
  if (!voiceGainNode) return;
  const settings = getAudioSettings();
  voiceGainNode.gain.value = settings.voiceVolume / 100;
}

function getEffectsGainMultiplier(): number {
  const settings = getAudioSettings();
  if (settings.effectsVolume === 'off') return 0;
  if (settings.effectsVolume === 'soft') return 0.4;
  return 1;
}

function getPlaybackRate(): number {
  const settings = getAudioSettings();
  if (settings.voiceSpeed === 'fast') return 1.3;
  if (settings.voiceSpeed === 'normal') return 1.0;
  return 0.75; // slow — default
}

export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// Track the currently playing voice source so we can stop it
let currentVoiceSource: AudioBufferSourceNode | null = null;

export function stopCurrentVoice() {
  if (currentVoiceSource) {
    try { currentVoiceSource.stop(); } catch {}
    try { currentVoiceSource.disconnect(); } catch {}
    currentVoiceSource = null;
  }
}

export async function playVoiceBuffer(buffer: AudioBuffer): Promise<void> {
  stopCurrentVoice();
  const ctx = getSharedAudioContext();
  const gain = getVoiceGainNode();
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = getPlaybackRate();
  source.connect(gain);
  currentVoiceSource = source;
  return new Promise<void>((resolve) => {
    source.onended = () => {
      if (currentVoiceSource === source) currentVoiceSource = null;
      try { source.disconnect(); } catch {}
      resolve();
    };
    source.start();
  });
}

export function playPopSound() {
  if (getEffectsGainMultiplier() === 0) return;
  try {
    const ctx = getSharedAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const vol = 0.2 * getEffectsGainMultiplier();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {
    console.warn("Audio pop failed", e);
  }
}

export function playSuccessSound() {
  if (getEffectsGainMultiplier() === 0) return;
  try {
    const ctx = getSharedAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const vol = 0.2 * getEffectsGainMultiplier();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    console.warn("Audio success failed", e);
  }
}

export function createPcmBlob(data: Float32Array): { data: string, mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}
