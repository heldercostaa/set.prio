# Catalog maintenance

The app bundles `src/data/catalog.json`; it does not fetch the lineup or research artists at runtime. Source URLs and verification dates belong in the catalog records so individual recommendations and images remain traceable.

## Refresh the lineup

```sh
pnpm catalog:refresh
```

The refresh discovers the event configuration from the official lineup, rebuilds appearances, and preserves curated metadata by stable identifiers. It never changes browser preferences. Failed or malformed responses leave the existing catalog intact.

Review the diff and source notes before publishing. Follow the rendered official day when source fields conflict, and leave unknown times empty. Preserve joint-act member identities and do not invent solo appearances.

## Curate artist details

- Keep source links for genre estimates, recommended recordings, and photo supplements in the catalog records.
- Use the vocabulary in `src/data/genres.ts` for genres and subgenres; leave unsupported classifications unknown.
- Verify recording identity and metadata. Label representative recordings when an exact joint-act set is unavailable. Reuse recording IDs to preserve shared ratings.
- Bundle optimized photos in `public/artists`; preserve their provenance and use the neutral fallback when no suitable photo exists.

After refreshing, run typecheck, catalog contracts, browser tests, and the production build as described in [development notes](./development.md).

Country metadata uses ISO country codes from public artist, label, agency, festival, and promoter biographies. It describes publicly identified nationality or country of origin, rather than a DJ's current residence. Each curated entry retains its sources and verification date; unresolved entries have no flag and remain available through Unknown country. The refresh script preserves this curation.

For b2b performances, flags and country filters use the constituent artists. Collectives such as HALŌ keep one billed act and recording; `countryAttributions` identifies each constituent act and its countries in the modal without changing priorities or ratings. Multiple selected countries match any represented country and combine with the other filters. Country filters do not restrict plan exports.
