import { readFile } from 'node:fs/promises';

const catalog = JSON.parse(
  await readFile(new URL('../src/data/catalog.json', import.meta.url), 'utf8')
);
const fixture = JSON.parse(
  await readFile(new URL('../docs/fixtures/readme-plan.json', import.meta.url), 'utf8')
);
const normalize = (value) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
const priorities = {};
for (const [day, groups] of Object.entries(fixture))
  for (const [priority, names] of Object.entries(groups))
    for (const name of names) {
      const artist = catalog.artists.find((a) => normalize(a.name) === normalize(name));
      const appearance = catalog.appearances.find(
        (a) => a.artistId === artist?.id && a.day === day
      );
      if (!appearance) throw new Error(`Missing screenshot appearance: ${name} / ${day}`);
      priorities[appearance.id] = priority;
    }
if (Object.keys(priorities).length !== 64)
  throw new Error('The supplied screenshot fixture must contain 64 appearances.');
export const readmePlan = {
  version: 1,
  language: 'en',
  activeDay: '2027-04-30',
  priorities,
  ratings: {},
  comments: {},
};
