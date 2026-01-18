import { MEDIA_CONSTRAINTS } from '../constants/videoCall';

export function getAccessToken(): string | null {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'accessToken') {
      return value;
    }
  }
  return localStorage.getItem('accessToken');
}

export async function getMediaStream(): Promise<MediaStream> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS);
    return stream;
  } catch (error) {
    console.error('Error accessing media devices:', error);

    if (error instanceof Error) {
      if (error.name === 'NotAllowedError') {
        throw new Error('Brak uprawnień do kamery/mikrofonu. Sprawdź ustawienia przeglądarki.');
      }
      if (error.name === 'NotFoundError') {
        throw new Error('Nie znaleziono kamery lub mikrofonu.');
      }
      if (error.name === 'NotReadableError') {
        throw new Error('Kamera lub mikrofon są używane przez inną aplikację.');
      }
    }

    throw new Error('Nie udało się uzyskać dostępu do kamery/mikrofonu.');
  }
}

export function formatDelayTime(seconds: number): string {
  if (seconds === 0) return '0s';
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  }
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function calculateLightDelay(distanceKm: number): number {
  const speedOfLight = 299792.458;
  return distanceKm / speedOfLight;
}

export const CELESTIAL_DISTANCES = {
  moon: {
    min: 356500,
    max: 406700,
    avg: 384400,
  },
  mars: {
    min: 54600000,
    max: 401000000,
    avg: 225000000,
  },
  sun: {
    avg: 149600000,
  },
};

export function getOneWayDelay(
  destination: keyof typeof CELESTIAL_DISTANCES,
  variant: 'min' | 'max' | 'avg' = 'avg'
): number {
  const distances = CELESTIAL_DISTANCES[destination];
  const distance =
    'avg' in distances && variant === 'avg'
      ? distances.avg
      : variant === 'min' && 'min' in distances
        ? distances.min
        : variant === 'max' && 'max' in distances
          ? distances.max
          : distances.avg;

  return calculateLightDelay(distance);
}

export function getRoundTripDelay(
  destination: keyof typeof CELESTIAL_DISTANCES,
  variant: 'min' | 'max' | 'avg' = 'avg'
): number {
  return getOneWayDelay(destination, variant) * 2;
}
