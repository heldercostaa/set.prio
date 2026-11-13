import { artistCountries, countryFlag } from './countries';
import { MAX_NOTES_LENGTH } from './artist-notes';
import { publicAsset } from './assets';
import { messages, priorityHasCode, priorityLabel } from '../i18n';
import type { Artist, Language, Priority, Recording } from '../types';

type RGB = [number, number, number];
const rgba = (color: RGB, alpha = 1) => `rgba(${color.join(',')},${alpha})`;
const mix = (a: RGB, b: RGB, amount: number): RGB => [
  Math.round(a[0] + (b[0] - a[0]) * amount),
  Math.round(a[1] + (b[1] - a[1]) * amount),
  Math.round(a[2] + (b[2] - a[2]) * amount),
];

function photoAccent(photos: HTMLImageElement[]): RGB {
  const swatch = document.createElement('canvas');
  swatch.width = swatch.height = 64;
  const context = swatch.getContext('2d', { willReadFrequently: true });
  if (!context) return [183, 161, 255];
  const bins = new Map<string, { weight: number; count: number; color: RGB }>();
  try {
    for (const photo of photos) {
      context.clearRect(0, 0, 64, 64);
      context.drawImage(photo, 0, 0, 64, 64);
      const pixels = context.getImageData(0, 0, 64, 64).data;
      for (let i = 0; i < pixels.length; i += 4) {
        const color: RGB = [pixels[i], pixels[i + 1], pixels[i + 2]];
        const high = Math.max(...color),
          low = Math.min(...color);
        const saturation = high ? (high - low) / high : 0;
        if (high < 55 || high > 245 || saturation < 0.15) continue;
        const key = color.map((value) => Math.round(value / 32)).join(',');
        const bin = bins.get(key) ?? { weight: 0, count: 0, color: [0, 0, 0] };
        bin.weight += (saturation * saturation * high) / 255;
        bin.count++;
        bin.color[0] += color[0];
        bin.color[1] += color[1];
        bin.color[2] += color[2];
        bins.set(key, bin);
      }
    }
  } catch {
    return [183, 161, 255];
  }
  const selected = [...bins.values()].sort((a, b) => b.weight - a.weight)[0];
  return selected
    ? [
        Math.round(selected.color[0] / selected.count),
        Math.round(selected.color[1] / selected.count),
        Math.round(selected.color[2] / selected.count),
      ]
    : [183, 161, 255];
}

export interface SetImageOptions {
  artist: Artist;
  recording: Recording;
  rating: number;
  language: Language;
  members?: Artist[];
  priority?: Priority | null;
  showFlags?: boolean;
  notes?: string;
}

export async function setImage(options: SetImageOptions): Promise<Blob> {
  await document.fonts.ready;
  const { artist, recording, rating, language, members, priority, showFlags = true } = options;
  const t = messages(language);
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1080;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');
  const family = getComputedStyle(document.body).fontFamily;
  const font = (size: number, weight = 500) => {
    ctx.font = `${weight} ${size}px ${family}`;
  };
  const text = (
    value: string,
    x: number,
    y: number,
    size: number,
    color = '#f5f5f7',
    weight = 500
  ) => {
    font(size, weight);
    ctx.fillStyle = color;
    ctx.fillText(value, x, y);
  };
  const wrap = (value: string, size: number, width: number) => {
    font(size, 650);
    const lines: string[] = [];
    let line = '';
    for (const word of value.split(/\s+/)) {
      if (line && ctx.measureText(`${line} ${word}`).width > width) {
        lines.push(line);
        line = '';
      }
      for (const character of (line ? ' ' : '') + word) {
        if (line && ctx.measureText(line + character).width > width) {
          lines.push(line);
          line = '';
        }
        line += character;
      }
    }
    if (line) lines.push(line);
    return lines;
  };
  const fit = (value: string, startingSize: number, width: number, maxLines: number) => {
    let size = startingSize;
    let lines = wrap(value, size, width);
    while (lines.length > maxLines && size > 24) {
      size -= 2;
      lines = wrap(value, size, width);
    }
    return { size, lines };
  };
  const image = async (path: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = publicAsset(path);
    await img.decode();
    return img;
  };
  const note = options.notes?.slice(0, MAX_NOTES_LENGTH).trim() ?? '';
  const wrappedNotes = note
    ? note.split(/\r?\n/).flatMap((line) => (line ? wrap(line, 28, 880) : ['']))
    : [];
  const noteLines = wrappedNotes.slice(0, 6);
  if (wrappedNotes.length > noteLines.length) {
    let last = noteLines[noteLines.length - 1].trimEnd();
    font(28, 650);
    while (ctx.measureText(`${last}…`).width > 880) last = last.slice(0, -1);
    noteLines[noteLines.length - 1] = `${last}…`;
  }
  if (noteLines.length) canvas.height = Math.max(1240, 986 + noteLines.length * 38 + 115);
  const footerY = canvas.height - 80;
  const memberPortraits = (members ?? []).filter((member) => member.photoUrl).slice(0, 2);
  const portraitArtists = memberPortraits.length ? memberPortraits : [artist];
  const [wordmark, sparkles, portraits] = await Promise.all([
    image('/wordmark.svg'),
    rating === 11 ? image('/icons/sparkles.svg') : Promise.resolve(null),
    Promise.all(
      portraitArtists.map((act) =>
        act.photoUrl ? image(act.photoUrl).catch(() => null) : Promise.resolve(null)
      )
    ),
  ]);
  const photos = portraits.filter((portrait): portrait is HTMLImageElement => portrait !== null);
  const accent = photoAccent(photos);
  const special = rating === 11;
  ctx.fillStyle = '#111113';
  ctx.fillRect(0, 0, 1080, canvas.height);
  photos.forEach((portrait, index) => {
    const layer = document.createElement('canvas');
    layer.width = 1080 / photos.length;
    layer.height = canvas.height;
    const photo = layer.getContext('2d');
    if (!photo) return;
    const wide = portrait.naturalWidth / portrait.naturalHeight > 1.6;
    const photoTop = wide ? canvas.height * 0.07 : 0;
    const photoHeight = wide
      ? (layer.width * portrait.naturalHeight) / portrait.naturalWidth
      : canvas.height;
    const scale = Math.max(
      layer.width / portrait.naturalWidth,
      photoHeight / portrait.naturalHeight
    );
    const cropWidth = layer.width / scale;
    const cropHeight = photoHeight / scale;
    photo.drawImage(
      portrait,
      (portrait.naturalWidth - cropWidth) / 2,
      (portrait.naturalHeight - cropHeight) * 0.3,
      cropWidth,
      cropHeight,
      0,
      photoTop,
      layer.width,
      photoHeight
    );
    const fade = photo.createLinearGradient(0, photoTop, 0, photoTop + photoHeight);
    fade.addColorStop(0, wide ? '#ffffff00' : '#ffffffcc');
    fade.addColorStop(0.12, '#ffffffff');
    fade.addColorStop(0.45, '#ffffffff');
    fade.addColorStop(1, '#ffffff00');
    photo.globalCompositeOperation = 'destination-in';
    photo.fillStyle = fade;
    photo.fillRect(0, 0, layer.width, layer.height);
    ctx.globalAlpha = special ? 0.24 : 0.18;
    ctx.drawImage(layer, index * layer.width, 0);
    ctx.globalAlpha = 1;
  });
  const glow = ctx.createRadialGradient(
    960,
    canvas.height * 0.65,
    0,
    960,
    canvas.height * 0.65,
    900
  );
  glow.addColorStop(0, rgba(accent, special ? 0.3 : 0.24));
  glow.addColorStop(1, rgba(accent, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 1080, canvas.height);
  if (special) {
    const halo = ctx.createRadialGradient(310, 650, 0, 310, 650, 480);
    halo.addColorStop(0, '#ffe4a31c');
    halo.addColorStop(1, '#ffe4a300');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, 1080, canvas.height);
  }
  ctx.drawImage(wordmark, 76, 64, 252, 53);
  ctx.textAlign = 'left';
  const countries = showFlags
    ? artistCountries(artist, members)
        .map(({ code }) => countryFlag(code))
        .filter(Boolean)
        .join(' ')
    : '';
  const name = fit(artist.name, 76, countries ? 800 : 928, 2);
  const lastNameY = noteLines.length ? 310 : priority ? 300 : 320;
  name.lines.forEach((line, index) => {
    text(
      line,
      76,
      lastNameY - (name.lines.length - 1 - index) * name.size * 1.1,
      name.size,
      '#f5f5f7',
      650
    );
  });
  if (countries) {
    if (name.lines.length === 1) {
      font(name.size, 650);
      const nameWidth = ctx.measureText(artist.name).width;
      text(countries, 76 + nameWidth + 20, lastNameY - 8, 28);
    } else text(countries, 76, lastNameY + 38, 28);
  }
  const event = fit(`${t.setAt} ${recording.eventLabel}`, 32, 928, 2);
  const eventY = lastNameY + (countries && name.lines.length > 1 ? 84 : 46);
  event.lines.forEach((line, index) => {
    text(line, 76, eventY + index * 38, event.size, '#c5c0cc', 400);
  });
  const score = new Intl.NumberFormat(language).format(rating);
  const scoreSize = noteLines.length ? (special ? 340 : 300) : special ? 400 : 340;
  const scoreY = eventY + (event.lines.length - 1) * 38 + 64 + scoreSize * 0.75;
  font(scoreSize, 650);
  const scoreWidth = ctx.measureText(score).width;
  if (special) {
    const gradient = ctx.createLinearGradient(76, scoreY - 270, 76 + scoreWidth, scoreY);
    gradient.addColorStop(0, '#ffe4a3');
    gradient.addColorStop(0.5, rgba(mix([255, 210, 226], accent, 0.18)));
    gradient.addColorStop(1, '#e9c5f4');
    ctx.fillStyle = gradient;
  } else ctx.fillStyle = rgba(mix([245, 245, 247], accent, 0.12));
  ctx.fillText(score, 76, scoreY);
  text('/10', 76 + scoreWidth + 22, scoreY, 66, '#b7b2bf', 400);
  if (special) {
    const caption = fit(t.beyondPerfect, 34, 880, 2);
    const captionY = scoreY + 78;
    if (sparkles) ctx.drawImage(sparkles, 76, captionY - 28, 32, 32);
    caption.lines.forEach((line, index) => {
      text(line, 124, captionY + index * 43, caption.size, '#f2dbe9');
    });
    for (const [x, y, size] of [
      [720, scoreY - 190, 10],
      [965, scoreY - 75, 8],
      [830, scoreY + 42, 6],
      [650, scoreY + 115, 5],
    ]) {
      ctx.beginPath();
      for (let point = 0; point < 8; point++) {
        const angle = (point * Math.PI) / 4;
        const radius = point % 2 ? size * 0.3 : size;
        ctx.lineTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
      }
      ctx.closePath();
      ctx.fillStyle = '#ffe4a399';
      ctx.fill();
    }
  }
  if (noteLines.length) {
    const firstNoteY = canvas.height - (priority ? 190 : 100) - (noteLines.length - 1) * 38;
    text(t.notes, 76, firstNoteY - 46, 24, '#aca6b3');
    noteLines.forEach((line, index) => {
      text(line, 76, firstNoteY + index * 38, 28, '#e4e1e8', 400);
    });
  }
  if (priority) {
    const label = priorityHasCode(priority)
      ? `${priority}  |  ${priorityLabel(priority, language)}`
      : priorityLabel(priority, language);
    font(28, 600);
    const width = ctx.measureText(label).width + 44;
    const color = getComputedStyle(document.documentElement)
      .getPropertyValue(`--priority-${priority.toLowerCase()}`)
      .trim();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(76, footerY - 39, width, 62, 17);
    ctx.globalAlpha = 0.09;
    ctx.fill();
    ctx.globalAlpha = 0.2;
    ctx.stroke();
    ctx.globalAlpha = 1;
    text(label, 98, footerY, 28, color, 600);
  }
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Image encoding failed'))),
      'image/png'
    )
  );
}
