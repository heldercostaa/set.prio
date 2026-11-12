import { readFile, mkdir, writeFile, rename } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'src/data/catalog.json');
const officialUrl = 'https://brasil.tomorrowland.com/pt/line-up/?page=artists';
const cdn = 'https://artist-lineup-cdn.tomorrowland.com/';
const allowedDays = new Set(['2027-04-30', '2027-05-01', '2027-05-02']);

async function fetchText(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`${response.status} while fetching ${url}`);
  return response.text();
}

async function refresh() {
  let previous = { artists: [], recordings: [] };
  try {
    previous = JSON.parse(await readFile(output, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const page = await fetchText(officialUrl);
  const nextData = page.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!nextData)
    throw new Error(
      'The official page no longer exposes its source configuration; existing catalog was preserved.'
    );
  const next = JSON.parse(nextData[1]);
  const block = next.props?.pageProps?.doc?.blocks?.find((item) => item.type === 'line-up');
  if (!block?.event || !block?.uuid)
    throw new Error('Missing official lineup configuration; existing catalog was preserved.');
  if (block.event !== 'TL27BR')
    throw new Error(
      'The official page targets a different edition; the Brasil 2027 catalog was preserved.'
    );
  const configUrl = `${cdn}config-${block.event}-${block.uuid}.json`;
  const config = JSON.parse(await fetchText(configUrl));
  const weekendUrls = config.config.weekends.map(
    (weekend) => `${cdn}${block.event}-${weekend.name}-${block.uuid}.json`
  );
  const weeks = await Promise.all(weekendUrls.map(async (url) => JSON.parse(await fetchText(url))));
  const performances = weeks.flatMap((week) => week.performances ?? []);
  if (!performances.length)
    throw new Error(
      'The official source returned no performances; existing catalog was preserved.'
    );
  const priorArtists = new Map(previous.artists.map((artist) => [artist.id, artist]));
  const artists = new Map();
  const appearances = [];
  const sourceNotes = (previous.sourceNotes ?? []).filter(
    (note) => !note.startsWith('Performance ')
  );
  function artistRecord(id, name, image, officialArtistId, memberIds) {
    const prior = priorArtists.get(id);
    const savedMemberIds = memberIds ?? prior?.memberIds;
    const photoFallback = prior?.photoFallback;
    const sourceImage = image ?? photoFallback?.sourceUrl ?? null;
    const unchangedImage =
      prior?.photoSourceUrl === sourceImage && prior?.photoUrl?.startsWith('/artists/');
    return {
      id,
      name,
      photoUrl: unchangedImage ? prior.photoUrl : ((image ? image : photoFallback?.url) ?? null),
      photoSourceUrl: sourceImage,
      ...(photoFallback ? { photoFallback } : {}),
      officialUrl: `${officialUrl}&artist=${encodeURIComponent(officialArtistId)}`,
      genre: prior?.genre ?? null,
      subgenres: prior?.subgenres ?? [],
      genreSources: prior?.genreSources ?? [],
      ...(prior?.genreVerifiedAt ? { genreVerifiedAt: prior.genreVerifiedAt } : {}),
      recommendedSetId: prior?.recommendedSetId ?? null,
      ...(savedMemberIds ? { memberIds: savedMemberIds } : {}),
      ...(prior?.recommendedSetRepresentative !== undefined
        ? { recommendedSetRepresentative: prior.recommendedSetRepresentative }
        : {}),
      ...(prior?.recommendationNote ? { recommendationNote: prior.recommendationNote } : {}),
    };
  }
  for (const performance of performances) {
    for (const artist of performance.artists ?? []) {
      artists.set(artist.id, artistRecord(artist.id, artist.name, artist.image, artist.id));
    }
  }
  for (const performance of performances) {
    const members = performance.artists ?? [];
    if (!members.length)
      throw new Error(
        `Performance ${performance.id} has no artists; review the source before updating.`
      );
    let artistId = members[0].id;
    if (members.length > 1) {
      artistId = `act:${performance.id}`;
      artists.set(
        artistId,
        artistRecord(
          artistId,
          performance.name,
          members.find((artist) => artist.image)?.image,
          members[0].id,
          members.map((artist) => artist.id)
        )
      );
    }
    const renderedDate = performance.startTime?.slice(0, 10);
    const day = allowedDays.has(renderedDate) ? renderedDate : null;
    if (performance.date !== renderedDate)
      sourceNotes.push(
        `Performance ${performance.id} (${performance.name}): date=${performance.date}, rendered day=${renderedDate}. The catalog follows the official component's rendered day.`
      );
    appearances.push({ id: performance.id, artistId, day });
  }
  const verifiedAt = new Date().toISOString().slice(0, 10);
  const catalog = {
    version: `${verifiedAt}.1`,
    verifiedAt,
    sources: [
      officialUrl,
      'https://components.tomorrowland.com/tml-live-lineup/live-lineup-base.js',
      configUrl,
      ...weekendUrls,
    ],
    artists: [...artists.values()].sort((a, b) => a.name.localeCompare(b.name, 'en')),
    appearances,
    recordings: previous.recordings,
    sourceArtistCount: new Set(
      performances.flatMap((performance) => performance.artists.map((artist) => artist.id))
    ).size,
    billedActCount: new Set(appearances.map((appearance) => appearance.artistId)).size,
    sourceNotes,
  };
  await mkdir(dirname(output), { recursive: true });
  await writeFile(`${output}.tmp`, `${JSON.stringify(catalog, null, 2)}\n`);
  await rename(`${output}.tmp`, output);
  console.log(
    `Refreshed ${catalog.sourceArtistCount} official artists, ${catalog.billedActCount} billed acts, and ${appearances.length} performances. Existing genre and recording curation was retained.`
  );
  console.log(
    'Review sourceNotes and research new artists before publishing. Artist photos are refreshed separately.'
  );
}

refresh().catch((error) => {
  console.error(`Catalog refresh failed: ${error.message}`);
  process.exitCode = 1;
});
