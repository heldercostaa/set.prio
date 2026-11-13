import { messages } from '../i18n';
import { usePlanner } from '../store/planner';
import type { Artist, Language } from '../types';
import { ArtistNationality } from './artist-nationality';

export function McStretchFractureFilter() {
  return (
    <svg width="0" height="0" aria-hidden="true" className="pointer-events-none absolute">
      <defs>
        <filter
          id="mc-stretch-slip"
          x="-0.02"
          y="-0.02"
          width="1.04"
          height="1.04"
          primitiveUnits="objectBoundingBox"
          colorInterpolationFilters="sRGB"
        >
          <feImage
            x="0"
            y="0"
            width="1"
            height="1"
            preserveAspectRatio="none"
            href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 1000'%3E%3Cpath fill='white' d='M620 0 602 200 636 340 596 490 640 650 606 820 624 1000H1000V0Z'/%3E%3C/svg%3E"
            result="rightMask"
          />
          <feComposite in="SourceGraphic" in2="rightMask" operator="out" result="leftSide" />
          <feComposite in="SourceGraphic" in2="rightMask" operator="in" result="rightSide" />
          <feOffset in="rightSide" dx="0.006" dy="0.005" result="slippedSide" />
          <feMerge>
            <feMergeNode in="leftSide" />
            <feMergeNode in="slippedSide" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}

export function McStretchLabel({ artist, language }: { artist: Artist; language: Language }) {
  const showFlags = usePlanner((s) => s.showArtistFlags);
  return (
    <span className="mc-stretch-label" aria-hidden="true">
      <span className="mc-stretch-left">
        {showFlags && <ArtistNationality artist={artist} language={language} />}
        MC
      </span>
      <span className="mc-stretch-right">STRETCH</span>
    </span>
  );
}

export function McStretchNotice({ language }: { language: Language }) {
  const t = messages(language);
  return (
    <div className="px-[17px] py-[15px]">
      <h3 className="text-lg font-medium leading-tight">{t.mcStretchQuestion}</h3>
    </div>
  );
}
