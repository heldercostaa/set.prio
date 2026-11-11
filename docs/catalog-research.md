# Catalog research

Verified November 11, 2026. This is a bundled snapshot, not a live festival feed.

## Official lineup coverage

The catalog contains **122 official artist entries**, **113 distinct billed acts**, and **118 performances**: Friday 41, Saturday 36, Sunday 41.

`artists` includes the 122 official source entries plus ten aggregate records for multi-artist performances. These aggregate IDs use `act:<official-performance-id>`. Their `memberIds` preserve the individual source identities. An artist appearing only in a b2b has no invented solo performance.

The official source currently has no timetable. It represents stages as FRIDAY, SATURDAY, and SUNDAY, with placeholder one-minute performance times. Real stage names and set times are therefore unknown. The application must not display those placeholders as a timetable.

Two source `date` fields disagree with the visible official component:

| Performance                                                           | Source `date` | Rendered day / `startTime` |
| --------------------------------------------------------------------- | ------------- | -------------------------- |
| 3236098959: Smash The House Take Over: Dimitri Vegas b2b Lilly Palmer | May 1         | Friday, April 30           |
| 3236152497: Krewella                                                  | May 2         | Saturday, May 1            |

The catalog follows the rendered day and `startTime`, matching the public component's grouping. These conflicts are recorded in `sourceNotes` for review when Tomorrowland updates its data.

Sources:

- [Official lineup](https://brasil.tomorrowland.com/pt/line-up/?page=artists)
- [Public lineup component](https://components.tomorrowland.com/tml-live-lineup/live-lineup-base.js)
- [Event configuration](https://artist-lineup-cdn.tomorrowland.com/config-TL27BR-7e1ab3d6-761f-4324-bac0-5af845b3e9b8.json)
- [Official performance snapshot](https://artist-lineup-cdn.tomorrowland.com/TL27BR-W1-7e1ab3d6-761f-4324-bac0-5af845b3e9b8.json)

## Photos

All 82 images supplied by the official source were downloaded and resized to a maximum dimension of 640 pixels, JPEG quality 75. They total approximately 4.6 MB. `photoSourceUrl` retains each original public URL. Aggregate acts use a member image as a representative photo. Entries without an official image intentionally use the application's neutral fallback.

## Genre estimates

126 of 132 artist/act records have an estimated primary genre and no more than two subgenres. The labels are LLM-assisted interpretations of known artist styles and the sourced recordings' titles, descriptions, and track-list context. The linked recording in `genreSources` lets listeners assess the estimate; it does not mean the publisher endorses that exact classification.

Due, ETTA, Fezzo, and Marian remain unclassified because reliable musical context was insufficient. MC STRETCH is a host. Special Surprise Act is unidentified. Their labels remain unknown instead of inferring a style from a name.

The prominent application warning applies to all estimates. These are subjective discovery aids, not definitive genre claims. Electronic pop and orchestral electronic entries retain the nature of those non-DJ acts.

## Recommended recordings

The snapshot has 122 distinct YouTube recordings, serving 130 of 132 artist/act entries. Only MC STRETCH and the unidentified Special Surprise Act have no verified artist-specific full recording.

Research favored recent, popular official Tomorrowland recordings. Artist, festival, venue, label, and established broadcaster uploads were used when a suitable Tomorrowland recording was unavailable. Complete recordings of at least 20 minutes were considered. Popularity, recency, identity, format, and source credibility were assessed together; search position alone was not treated as selection evidence.

Every recommendation has a genuine video ID, watch URL, title, publisher, verified view count, verification date, and selection rationale. Public YouTube search supplied titles, channels, durations, relative publication ages, and view counts. Watch pages verified exact upload dates for 62 recordings. Subsequent watch requests received HTTP 429; remaining exact dates are `null`. No publication dates were derived from relative ages.

An event year is included only when supported by the title or description. A few event labels explicitly say “published YYYY” where only the publication year is known. Some venue/session labels omit the event year rather than implying that upload year equals performance year.

Exact joint recordings were found for Aline Rocha b2b Ratier, Bella Claxton b2b Paige Tomlinson, and Ferry Corsten b2b Marsh. The Aline Rocha / Ratier video may require YouTube sign-in. Other joint acts without an exact recording use a clearly labeled representative member recording. The Melodicca recommendation is a Matisse & Sadko recording, not a verified recording of that production. Ekanta & Swarup uses an Ekanta recording, with the limitation stated.

Use `artist.recommendedSetRepresentative` and `artist.recommendationNote` before the recording's generic flag. This allows the same video to represent a joint act while remaining an exact artist match for its solo entry. Reusing a recording ID preserves shared user ratings.

## Refreshing the lineup

Run:

```sh
node scripts/update-catalog.mjs
```

The script discovers the current public event configuration from the official page, fetches its configured weekend snapshots, and rebuilds the artist/appearance inventory. It preserves curation by stable IDs, local photos when the source image is unchanged, and all recording metadata. It never reads or writes browser localStorage.

The update is atomic. Missing configuration, an empty response, malformed data, or network failures leave the prior catalog intact. Review the diff and `sourceNotes` before publishing. Research newly announced artists and update genre/recording choices manually. New source photos remain remote URLs until downloaded and optimized. Run the application's typecheck, tests, and production build after a catalog change.

## Artist-owned portrait supplements

Verified November 11, 2026. 20 missing images were supplemented from artist websites, press kits, and artist-owned Bandcamp, Linktree, or solo.to profiles. Local optimized JPEGs are bundled; the app makes no runtime photo searches. `photoFallback` retains the source page, original image URL, local asset, and verification date. Catalog refreshes prefer new festival images and preserve these supplements when the festival provides none. Photos of projects and billed collaborations may represent their members.

- Alan Walker: [source](https://www.alanwalker.com/en/presskit)
- Bauhouse: [source](https://bauhouse.bandcamp.com/)
- Bruna Strait: [source](https://solo.to/brunastrait)
- Chelina Manuhutu: [source](https://chelina-manuhutu.com/)
- D-Nox: [source](https://d-nox.digital/)
- Deer Jade: [source](https://www.deerjade.com/)
- Enrico Sangiuliano: [source](https://enricosangiuliano.com/)
- ETTA: [source](https://linktr.ee/ettamusic)
- Fezzo: [source](https://linktr.ee/fezzomusic)
- K Motionz: [source](https://linktr.ee/kmotionz)
- Krewella: [source](https://krewella.com/)
- Kris Kross Amsterdam: [source](https://kriskross.amsterdam/)
- Marsh: [source](https://marshmusician.com/)
- Matisse & Sadko present Melodicca: [source](https://www.matissesadko.com/)
- Pacs: [source](https://solo.to/dj.pacs)
- Pendulum (DJ-set): [source](https://pendulum.com/)
- Ratier: [source](https://www.ratier.com.br/)
- Ray Volpe: [source](https://rayvol.pe/tour)
- Riascode: [source](https://linktr.ee/riascode)
- simo not simon: [source](https://simonotsimon.bandcamp.com/)

Representative member photos also cover Bauhouse b2b simo not simon and the Dimitri Vegas b2b Lilly Palmer billing.

No verified usable artist-owned portrait was found for: 999999999, Adalamoon, Astrix, Bebe Rexha, Bella Claxton, Delcu, Ekanta & Swarup, Ekanta & Swarup + Special Surprise Act, Gareth Emery, M4RI Carrilho, Mad Maxx, Malu, Marian, Renato Cohen, SHEE, Smash The House Take Over: Bassjackers, Special Surprise Act, Vermont, Viot, Volkoder. These entries retain the neutral fallback.
