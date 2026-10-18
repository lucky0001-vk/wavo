import { SubtitleTrack } from '@/types/media-browser';

/**
 * Converts SubRip (.srt) text content into WebVTT (.vtt) format
 */
export function convertSrtToVtt(srtContent: string): string {
  if (!srtContent) return 'WEBVTT\n\n';

  // Normalize line endings
  let text = srtContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

  // Replace comma decimal separators in timestamps with dots: 00:01:23,456 --> 00:01:23.456
  text = text.replace(
    /(\d{2}:\d{2}:\d{2}),(\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}),(\d{3})/g,
    '$1.$2 --> $3.$4'
  );

  // If timestamp lacks hours (e.g. 01:23,456), convert to 00:01:23.456
  text = text.replace(
    /(\b\d{2}:\d{2}),(\d{3})\s*-->\s*(\b\d{2}:\d{2}),(\d{3})/g,
    '00:$1.$2 --> 00:$3.$4'
  );

  return `WEBVTT\n\n${text}\n`;
}

/**
 * Creates a browser Blob URL for a subtitle file (.srt or .vtt)
 */
export async function createSubtitleTrackFromFile(
  file: File,
  language: string = 'en',
  label?: string
): Promise<SubtitleTrack> {
  const isSrt = file.name.toLowerCase().endsWith('.srt');
  const text = await file.text();

  let vttText = text;
  if (isSrt) {
    vttText = convertSrtToVtt(text);
  } else if (!vttText.startsWith('WEBVTT')) {
    vttText = `WEBVTT\n\n${vttText}`;
  }

  const blob = new Blob([vttText], { type: 'text/vtt' });
  const blobUrl = URL.createObjectURL(blob);

  return {
    id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    label: label || file.name.replace(/\.[^/.]+$/, ''),
    language,
    blobUrl,
    fileName: file.name,
  };
}
