import { WatchedStatus } from './watched-status';
import { DragHint } from './drag-hint';
import * as HoverCard from '@radix-ui/react-hover-card';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { ArrowUpRight, Disc3, Music2, Play, Star } from 'lucide-react';
import { motion, useIsPresent } from 'motion/react';
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { publicAsset } from '../utils/assets';
export const ArtistPreviewContext = createContext(true);
const PreviewOwnerContext = createContext<{
  active: string | null;
  setActive: Dispatch<SetStateAction<string | null>>;
} | null>(null);
export function ArtistPreviewCoordinator({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <PreviewOwnerContext.Provider value={{ active, setActive }}>
      {children}
    </PreviewOwnerContext.Provider>
  );
}
import { artistById, recordingById, membersFor } from '../data';
import { dayName, messages } from '../i18n';
import type { Appearance, Artist, Language, Priority, Recording } from '../types';

export function Portrait({ artist, className = '' }: { artist: Artist; className?: string }) {
  const [failed, setFailed] = useState(false);
  return artist.photoUrl && !failed ? (
    <img
      className={`portrait object-cover [object-position:center] block [background:var(--chip)] ${className}`}
      src={publicAsset(artist.photoUrl)}
      alt={artist.name}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  ) : (
    <div
      className={`portrait object-cover [object-position:center] block [background:var(--chip)] portrait-fallback grid [place-items:center] bg-raised [color:var(--tertiary)] [font-size:1.25rem] font-semibold ${className}`}
      aria-hidden="true"
    >
      <span>
        {artist.name
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => part[0])
          .join('')}
      </span>
    </div>
  );
}
export function Genres({ artist, language }: { artist: Artist; language: Language }) {
  return (
    <div className="genre-tags flex gap-1.25 flex-wrap">
      {artist.genre ? (
        <>
          <span className="genre-tag text-content font-semibold inline-flex items-center gap-1.25 [font-size:0.625rem] [line-height:1.4] [padding:0.3125rem_0.4375rem] rounded-sm [background:var(--chip)]">
            <Music2 size="0.75rem" />
            {artist.genre}
          </span>
          {artist.subgenres.map((genre) => (
            <span
              className="subgenre-tag text-muted inline-flex items-center gap-1.25 [font-size:0.625rem] [line-height:1.4] [padding:0.3125rem_0.4375rem] rounded-sm [background:var(--chip)]"
              key={genre}
            >
              {genre}
            </span>
          ))}
        </>
      ) : (
        <span className="muted text-muted small text-xs [line-height:1.55]">
          {messages(language).unknownGenre}
        </span>
      )}
    </div>
  );
}
export function SetLink({
  recording,
  language,
  compact = false,
  representative,
}: {
  recording: Recording | undefined;
  language: Language;
  compact?: boolean;
  representative?: boolean;
}) {
  const t = messages(language);
  if (!recording)
    return (
      <div className="set-unavailable flex items-center gap-2 text-muted [font-size:0.6875rem] [padding:0.75rem_0] [line-height:1.6] [&_svg]:shrink-0">
        <Disc3 size="1.0625rem" />
        <span>{t.unavailable}</span>
      </div>
    );
  return (
    <a
      className={`set-link flex items-center gap-3 border border-separator bg-raised rounded-xl p-3.25 min-h-16.5 [transition:border-color_0.15s,_background_0.15s] hover:[background:var(--hover)] hover:[border-color:var(--tertiary)] [&_>_svg]:text-muted [&_>_svg]:[margin-left:auto] [&_>_svg]:shrink-0 ${compact ? 'compact-set' : ''}`}
      href={recording.youtubeUrl}
      target="_blank"
      rel="noreferrer"
    >
      <span className="play-icon grid [place-items:center] w-8.75 h-8.75 rounded-lg [color:var(--red)] [background:color-mix(in_srgb,_var(--red)_9%,_transparent)] shrink-0">
        <Play size={compact ? 14 : 18} fill="currentColor" />
      </span>
      <span className="set-link-text flex flex-col gap-1 min-w-0 [&_strong]:text-xs [&_strong]:font-semibold [&_strong]:[overflow-wrap:anywhere] [&_>_span]:text-muted [&_>_span]:[font-size:0.625rem]">
        <strong>{recording.eventLabel}</strong>{' '}
        <span>
          {(representative ?? recording.representative) ? t.representative : recording.channel}
        </span>
      </span>
      <ArrowUpRight size="1.0625rem" />
    </a>
  );
}
function Preview({ artist, language }: { artist: Artist; language: Language }) {
  const recording = artist.recommendedSetId
    ? recordingById.get(artist.recommendedSetId)
    : undefined;
  const members = membersFor(artist);
  if (members.length)
    return (
      <div className="preview-body p-4 flex flex-col gap-3">
        <strong className="preview-name [font-size:1.0625rem] [letter-spacing:-0.02em]">
          {artist.name}
        </strong>
        {members.map((member) => (
          <section
            className="preview-member grid gap-2.5 pt-3 [border-top:0.0625rem_solid_var(--line)]"
            aria-label={member.name}
            key={member.id}
          >
            <div className="preview-member-heading flex gap-3 items-center [&_>_.portrait]:w-13.5 [&_>_.portrait]:h-13.5 [&_>_.portrait]:rounded-lg [&_>_.portrait]:shrink-0 [&_>_div]:min-w-0 [&_>_div]:grid [&_>_div]:gap-1.75">
              <Portrait artist={member} />
              <div>
                <strong>{member.name}</strong>
                <Genres artist={member} language={language} />
              </div>
            </div>
            <SetLink
              recording={
                member.recommendedSetId ? recordingById.get(member.recommendedSetId) : undefined
              }
              language={language}
              representative={member.recommendedSetRepresentative}
              compact
            />
          </section>
        ))}
        {recording && !(artist.recommendedSetRepresentative ?? recording.representative) && (
          <>
            <span className="eyebrow [font-size:0.6875rem] font-semibold [letter-spacing:0.045em] muted text-muted">
              {messages(language).jointRecording}
            </span>
            <SetLink recording={recording} language={language} compact />
          </>
        )}
      </div>
    );
  return (
    <>
      <Portrait artist={artist} className="preview-photo w-full h-38 [object-position:50%_35%]" />
      <div className="preview-body p-4 flex flex-col gap-3">
        <strong className="preview-name [font-size:1.0625rem] [letter-spacing:-0.02em]">
          {artist.name}
        </strong>
        <span className="eyebrow [font-size:0.6875rem] font-semibold [letter-spacing:0.045em] muted text-muted">
          {messages(language).genreShort}
        </span>
        <Genres artist={artist} language={language} />
        <SetLink
          recording={recording}
          language={language}
          representative={artist.recommendedSetRepresentative}
          compact
        />
      </div>
    </>
  );
}
export function ArtistChip({
  appearance,
  language,
  priority,
  onOpen,
  onQuick,
}: {
  appearance: Appearance;
  language: Language;
  priority: Priority | null;
  onOpen: (id: string) => void;
  onQuick?: (id: string | null) => void;
}) {
  const artist = artistById.get(appearance.artistId);
  const isPresent = useIsPresent();
  const owner = useContext(PreviewOwnerContext);
  const [localPreview, setLocalPreview] = useState(false);
  const preview = owner ? owner.active === appearance.id : localPreview;
  const setPreview = (open: boolean, transfer = false) => {
    if (!owner) {
      setLocalPreview(open);
      return;
    }
    owner.setActive((current) =>
      open
        ? transfer || !current || current === appearance.id
          ? appearance.id
          : current
        : current === appearance.id
          ? null
          : current
    );
  };
  const previewsAllowed = useContext(ArtistPreviewContext);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: appearance.id,
    data: { appearance },
    disabled: !appearance.day || !isPresent,
  });
  if (!artist) return null;
  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 3 }}
      animate={{ opacity: isDragging ? 0.35 : 1, y: 0 }}
      className="chip-wrapper relative hover:z-20 focus-within:z-20 flex [flex:0_0_auto] [width:max-content] min-w-0 [max-width:100%]"
      onPointerEnter={(event) => {
        if (event.pointerType !== 'touch') onQuick?.(appearance.id);
      }}
      onPointerLeave={() => onQuick?.(null)}
      inert={!isPresent}
      aria-hidden={!isPresent}
      style={{ zIndex: isDragging ? 3 : undefined }}
    >
      <HoverCard.Root
        open={isPresent && previewsAllowed && preview && !isDragging}
        onOpenChange={setPreview}
        openDelay={350}
        closeDelay={160}
      >
        <HoverCard.Trigger asChild>
          <button
            type="button"
            data-artist-id={artist.id}
            data-appearance-id={appearance.id}
            className={`artist-chip group/card relative flex w-full min-w-0 items-center min-h-10 [max-width:100%] gap-0.75 [padding:0.5rem_0.625rem] text-sm font-medium [line-height:1.5] text-left rounded-lg border border-transparent bg-raised text-content [transition:background_0.15s,_border-color_0.15s,_box-shadow_0.15s] [cursor:grab] max-[68.75rem]:[font-size:0.8125rem] max-[68.75rem]:[padding:0.5rem_0.625rem] [&_>_span]:min-w-0 [&_>_span]:[overflow-wrap:anywhere] hover:[background:var(--hover)] hover:border-separator active:[cursor:grabbing] [&.is-prioritized]:bg-raised ${priority ? 'is-prioritized' : ''}`}
            ref={setNodeRef}
            style={{ transform: CSS.Translate.toString(transform) }}
            {...attributes}
            {...listeners}
            onFocus={() => setPreview(true, true)}
            onBlur={() => setPreview(false)}
            onClick={() => {
              if (!isDragging) {
                setPreview(false);
                onOpen(artist.id);
              }
            }}
            aria-label={`${artist.name} · ${dayName(appearance.day, language)}`}
          >
            <span>{artist.name}</span>
            <DragHint />
            <WatchedStatus artist={artist} language={language} />
          </button>
        </HoverCard.Trigger>
        <HoverCard.Portal>
          <HoverCard.Content
            className="artist-preview w-72 [max-width:calc(100vw_-_1.5rem)] bg-surface text-content rounded-2xl overflow-hidden [box-shadow:var(--shadow)] [z-index:40] [animation:reveal_0.16s_ease-out] [max-height:min(32.5rem,_calc(100dvh_-_2rem))] overflow-y-auto max-[47.5rem]:hidden"
            side="right"
            align="start"
            sticky="always"
            sideOffset={10}
            collisionPadding={12}
            onFocusCapture={() => setPreview(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node)) setPreview(false);
            }}
          >
            <Preview artist={artist} language={language} />
          </HoverCard.Content>
        </HoverCard.Portal>
      </HoverCard.Root>
    </motion.div>
  );
}
export function ArtistCard({
  artist,
  language,
  prioritized,
  onOpen,
}: {
  artist: Artist;
  language: Language;
  prioritized: boolean;
  onOpen: (id: string) => void;
}) {
  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="catalog-card min-w-0 flex items-center text-left gap-3 min-h-20.75 [padding:0.5625rem_0.625rem] bg-transparent rounded-xl [transition:background_0.15s] max-[47.5rem]:[padding:0.625rem_0.5rem] max-[47.5rem]:gap-3 hover:[background:var(--hover)]"
      data-artist-id={artist.id}
      onClick={() => onOpen(artist.id)}
    >
      <Portrait
        artist={artist}
        className="catalog-photo w-13.75 h-13.75 rounded-xl shrink-0 max-[47.5rem]:w-14 max-[47.5rem]:h-14"
      />
      <span className="catalog-card-body flex flex-col gap-1.25 min-w-0 [&_strong]:text-xs [&_strong]:font-semibold [&_strong]:[overflow-wrap:anywhere] [&_>_span]:[font-size:0.625rem] [&_>_span]:text-muted max-[47.5rem]:[&_strong]:[font-size:0.8125rem] max-[47.5rem]:[&_>_span]:[font-size:0.6875rem]">
        <strong>{artist.name}</strong>
        <WatchedStatus artist={artist} language={language} />
        <span>{artist.genre ?? messages(language).unknownGenre}</span>
      </span>
      {prioritized ? (
        <Star
          size="1.0625rem"
          className="selected-star [color:var(--orange)] [margin-left:auto] shrink-0 [color:var(--tertiary)]"
          fill="currentColor"
          aria-label={messages(language).prioritized}
        />
      ) : (
        <ArrowUpRight
          size="1.0625rem"
          className="catalog-open [margin-left:auto] shrink-0 [color:var(--tertiary)]"
        />
      )}
    </motion.button>
  );
}
