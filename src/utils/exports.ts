import { publicAsset } from './assets';
import { dayName, messages, priorityLabel, shortDate } from '../i18n';
import {
  DAYS,
  PRIORITIES,
  type Appearance,
  type Artist,
  type Catalog,
  type Language,
  type Preferences,
  type Priority,
  type Recording,
} from '../types';
export const COLUMNS = [
  'Name',
  'At',
  'Day',
  'Priority',
  'Genre',
  'Sub-genres',
  'Rating',
  'Comment',
] as const;
export interface ExportEntry {
  artist: Artist;
  appearance: Appearance;
  recording: Recording | undefined;
  priority: Priority;
  rating: number | null;
  comment: string;
  members?: { artist: Artist; recording: Recording | undefined; rating: number | null }[];
}
export function collectEntries(catalog: Catalog, preferences: Preferences): ExportEntry[] {
  const artists = new Map(catalog.artists.map((a) => [a.id, a]));
  const recordings = new Map(catalog.recordings.map((r) => [r.id, r]));
  return catalog.appearances
    .flatMap((appearance) => {
      const priority = preferences.priorities[appearance.id];
      const artist = artists.get(appearance.artistId);
      if (!artist || !priority) return [];
      const recording = artist.recommendedSetId
        ? recordings.get(artist.recommendedSetId)
        : undefined;
      return [
        {
          artist,
          appearance,
          recording,
          priority,
          rating: recording ? (preferences.ratings[recording.id] ?? null) : null,
          comment: preferences.comments[appearance.id] ?? '',
          members: artist.memberIds?.flatMap((id) => {
            const member = artists.get(id);
            if (!member) return [];
            const set = member.recommendedSetId
              ? recordings.get(member.recommendedSetId)
              : undefined;
            return [
              {
                artist: member,
                recording: set,
                rating: set ? (preferences.ratings[set.id] ?? null) : null,
              },
            ];
          }),
        },
      ];
    })
    .sort(
      (a, b) =>
        (a.appearance.day ?? '9999').localeCompare(b.appearance.day ?? '9999') ||
        a.priority.localeCompare(b.priority) ||
        a.artist.name.localeCompare(b.artist.name, preferences.language)
    );
}
function tableEntries(entries: ExportEntry[], language: Language): ExportEntry[] {
  return entries
    .flatMap((entry) => {
      if (
        !/\bb2b\b/i.test(entry.artist.name) ||
        !entry.members?.length ||
        entry.members.length !== entry.artist.memberIds?.length
      )
        return [entry];
      return entry.members.map((member) => ({
        ...entry,
        ...member,
        artist: {
          ...member.artist,
          name: `${member.artist.name} (${messages(language).fromB2b}: ${entry.artist.name})`,
        },
        members: undefined,
      }));
    })
    .sort(
      (a, b) =>
        (a.appearance.day ?? '9999').localeCompare(b.appearance.day ?? '9999') ||
        a.priority.localeCompare(b.priority) ||
        a.artist.name.localeCompare(b.artist.name, language)
    );
}
function representativeSuffix(entry: ExportEntry, language: Language) {
  return (entry.artist.recommendedSetRepresentative ?? entry.recording?.representative)
    ? ` · ${messages(language).representative}`
    : '';
}
function cells(entry: ExportEntry, language: Language) {
  return [
    entry.artist.name,
    entry.recording
      ? `${entry.recording.eventLabel} (${entry.recording.youtubeUrl})${representativeSuffix(entry, language)}`
      : '',
    dayName(entry.appearance.day, language),
    entry.priority === 'P4' ? priorityLabel(entry.priority, language) : entry.priority,
    entry.artist.genre ?? '',
    entry.artist.subgenres.join(', '),
    entry.rating === null ? '' : String(entry.rating),
    entry.comment,
  ];
}
export function toCsv(entries: ExportEntry[], language: Language) {
  const escapeCell = (value: string) => {
    // biome-ignore lint/suspicious/noControlCharactersInRegex: Leading control bytes can conceal spreadsheet formulas.
    const safe = /^[\s\u0000-\u001f]*[=+\-@]/.test(value) ? `'${value}` : value;
    return `"${safe.replaceAll('"', '""')}"`;
  };
  return `\uFEFF${[COLUMNS, ...tableEntries(entries, language).map((entry) => cells(entry, language))].map((row) => row.map(escapeCell).join(',')).join('\r\n')}`;
}
const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
export function notionPayload(entries: ExportEntry[], language: Language) {
  const rows = tableEntries(entries, language);
  const htmlRows = rows
    .map(
      (entry) =>
        `<tr>${cells(entry, language)
          .map((value, index) => {
            const recording = entry.recording;
            const content =
              index === 1 && recording
                ? `<a href="${escapeHtml(recording.youtubeUrl)}">${escapeHtml(recording.eventLabel)}</a>${escapeHtml(representativeSuffix(entry, language))}`
                : escapeHtml(value).replaceAll('\n', '<br>');
            return `<td>${content}</td>`;
          })
          .join('')}</tr>`
    )
    .join('');
  return {
    html: `<html><body><table><thead><tr>${COLUMNS.map((column) => `<th>${column}</th>`).join('')}</tr></thead><tbody>${htmlRows}</tbody></table></body></html>`,
    text: [COLUMNS, ...rows.map((entry) => cells(entry, language))]
      .map((row) =>
        row
          .map((value) => value.replaceAll('\t', ' ').replaceAll('\r', '').replaceAll('\n', ' / '))
          .join('\t')
      )
      .join('\n'),
  };
}
export async function copyNotion(
  payload: ReturnType<typeof notionPayload>
): Promise<'html' | 'text'> {
  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': new Blob([payload.html], { type: 'text/html' }),
        'text/plain': new Blob([payload.text], { type: 'text/plain' }),
      }),
    ]);
    return 'html';
  }
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(payload.text);
    return 'text';
  }
  throw new Error('Clipboard unavailable');
}
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const palette = { P0: '#ff6961', P1: '#ffb266', P2: '#ffe066', P3: '#70d7c7', P4: '#b7a1ff' };
export async function boardImage(entries: ExportEntry[], language: Language): Promise<Blob> {
  await document.fonts.ready;
  const t = messages(language);
  const days = [...DAYS, ...(entries.some((entry) => entry.appearance.day === null) ? [null] : [])];
  const width = 1440,
    padding = 40,
    gap = 22,
    top = 148;
  const columnWidth = (width - padding * 2 - gap * (days.length - 1)) / days.length;
  const innerWidth = columnWidth - 40;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas unavailable');
  const family = getComputedStyle(document.body).fontFamily;
  const font = (weight: number, size: number) => `${weight} ${size}px ${family}`;
  context.font = font(400, 14);
  const wrap = (value: string, maxWidth: number) => {
    const lines: string[] = [];
    let line = '';
    for (const word of value.split(/\s+/)) {
      if (line && context.measureText(`${line} ${word}`).width > maxWidth) {
        lines.push(line);
        line = '';
      }
      if (context.measureText(word).width > maxWidth) {
        for (const character of word) {
          if (line && context.measureText(line + character).width > maxWidth) {
            lines.push(line);
            line = '';
          }
          line += character;
        }
      } else line += (line ? ' ' : '') + word;
    }
    if (line) lines.push(line);
    return lines;
  };
  const columns = days.map((day) => {
    const groups = PRIORITIES.map((priority) => {
      let x = 0,
        y = 0,
        rowHeight = 0;
      const names = entries
        .filter((entry) => entry.appearance.day === day && entry.priority === priority)
        .map((entry) => {
          const lines = wrap(entry.artist.name, innerWidth - 24);
          const chipWidth = Math.min(
            innerWidth,
            Math.ceil(Math.max(...lines.map((line) => context.measureText(line).width))) + 24
          );
          const chipHeight = lines.length * 22 + 20;
          if (x && x + chipWidth > innerWidth) {
            y += rowHeight + 8;
            x = 0;
            rowHeight = 0;
          }
          const chip = { lines, x, y, width: chipWidth, height: chipHeight };
          x += chipWidth + 8;
          rowHeight = Math.max(rowHeight, chipHeight);
          return chip;
        });
      return { priority, names, height: Math.max(116, 64 + y + rowHeight + 20) };
    });
    return {
      day,
      groups,
      count: groups.reduce((sum, group) => sum + group.names.length, 0),
      height: 112 + groups.reduce((sum, group) => sum + group.height, 0),
    };
  });
  const height = top + Math.max(...columns.map((column) => column.height)) + 96;
  canvas.width = width * 2;
  canvas.height = height * 2;
  context.scale(2, 2);
  context.textBaseline = 'middle';
  const text = '#f5f5f7',
    secondary = '#a1a1a6',
    line = '#38383a';
  const box = (
    x: number,
    y: number,
    w: number,
    h: number,
    radius: number,
    fill: string,
    border?: string
  ) => {
    context.beginPath();
    context.roundRect(x, y, w, h, radius);
    context.fillStyle = fill;
    context.fill();
    if (border) {
      context.strokeStyle = border;
      context.lineWidth = 1;
      context.stroke();
    }
  };
  const label = (
    value: string,
    x: number,
    y: number,
    size: number,
    weight: number,
    color = text
  ) => {
    context.font = font(weight, size);
    context.fillStyle = color;
    context.fillText(value, x, y + size * 0.65);
  };
  const loadImage = async (path: string) => {
    const image = new Image();
    image.src = publicAsset(path);
    await image.decode();
    return image;
  };
  const [icon, dayIcon] = await Promise.all(['/logo.svg', '/icons/audio-lines.svg'].map(loadImage));
  context.fillStyle = '#111113';
  context.fillRect(0, 0, width, height);
  context.drawImage(icon, padding, 40, 56, 56);
  box(padding, 40, 56, 56, 13, '#00000000', '#ffffff40');
  label('set', padding + 72, 36, 34, 700);
  const setWidth = context.measureText('set').width;
  label('.', padding + 72 + setWidth, 36, 34, 700, '#ff453a');
  const dotWidth = context.measureText('.').width;
  label('priority', padding + 72 + setWidth + dotWidth, 36, 34, 700);
  label('Tomorrowland Brasil 2027', padding + 72, 80, 16, 500, secondary);
  context.textAlign = 'right';
  label(t.dateRange, width - padding, 42, 17, 500, secondary);
  label(`${entries.length} ${t.prioritized}`, width - padding, 76, 16, 500, secondary);
  context.textAlign = 'left';
  columns.forEach((column, index) => {
    const x = padding + index * (columnWidth + gap);
    box(x, top, columnWidth, column.height, 20, '#1c1c1e', line);
    context.save();
    context.beginPath();
    context.roundRect(x, top, columnWidth, column.height, 20);
    context.clip();
    context.fillStyle = '#1c1c1e';
    context.fillRect(x, top, columnWidth, 112);
    context.restore();
    label(
      column.day ? shortDate(column.day, language).toLocaleUpperCase(language) : t.dayTba,
      x + 20,
      top + 22,
      12,
      600,
      secondary
    );
    context.textAlign = 'right';
    label(`${column.count} ${t.prioritized}`, x + columnWidth - 20, top + 22, 12, 400, secondary);
    context.textAlign = 'left';
    context.drawImage(dayIcon, x + 20, top + 59, 25, 25);
    label(dayName(column.day, language), x + 56, top + 56, 24, 600);
    context.strokeStyle = line;
    context.beginPath();
    context.moveTo(x, top + 112);
    context.lineTo(x + columnWidth, top + 112);
    context.stroke();
    let y = top + 112;
    for (const group of column.groups) {
      const color = palette[group.priority];
      const title = priorityLabel(group.priority, language);
      context.font = font(500, 12);
      const badgeWidth = context.measureText(title).width + (group.priority === 'P4' ? 29 : 61);
      box(x + 20, y + 20, badgeWidth, 27, 6, `${color}17`);
      context.beginPath();
      context.arc(x + 30, y + 33.5, 2.5, 0, Math.PI * 2);
      context.fillStyle = color;
      context.fill();
      if (group.priority !== 'P4') label(group.priority, x + 38, y + 25, 12, 600, color);
      if (group.priority !== 'P4') {
        context.strokeStyle = `${color}45`;
        context.beginPath();
        context.moveTo(x + 62, y + 26);
        context.lineTo(x + 62, y + 41);
        context.stroke();
      }
      label(title, x + (group.priority === 'P4' ? 38 : 70), y + 25, 12, 500, color);
      context.textAlign = 'right';
      label(String(group.names.length), x + columnWidth - 22, y + 26, 12, 400, secondary);
      context.textAlign = 'left';
      for (const chip of group.names) {
        const cx = x + 20 + chip.x,
          cy = y + 62 + chip.y;
        box(cx, cy, chip.width, chip.height, 8, '#1c1c1e', line);
        chip.lines.forEach((value, i) => {
          label(value, cx + 12, cy + 12 + i * 22, 14, 400);
        });
      }
      if (!group.names.length) label('—', x + 20, y + 65, 16, 400, secondary);
      y += group.height;
      if (group.priority !== PRIORITIES.at(-1)) {
        context.strokeStyle = line;
        context.beginPath();
        context.moveTo(x + 20, y);
        context.lineTo(x + columnWidth - 20, y);
        context.stroke();
      }
    }
  });
  label(
    `${t.createdBy} Helder Costa · github.com/heldercostaa`,
    padding,
    height - 44,
    13,
    400,
    secondary
  );
  context.textAlign = 'right';
  label('set.priority', width - padding, height - 44, 13, 500, secondary);
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Image encoding failed'))),
      'image/png'
    )
  );
}
