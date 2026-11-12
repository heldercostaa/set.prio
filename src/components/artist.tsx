import * as HoverCard from '@radix-ui/react-hover-card';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { ArrowUpRight, Disc3, GripVertical, Music2, Play, Star } from 'lucide-react';
import { motion, useIsPresent } from 'motion/react';
import { createContext, useContext, useState } from 'react';
import { publicAsset } from '../utils/assets';
export const ArtistPreviewContext = createContext(true);
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
      className={`portrait object-cover [object-position:center] block [background:var(--chip)] portrait-fallback grid [place-items:center] [background:linear-gradient(135deg,_var(--chip),_var(--hover))] [color:var(--tertiary)] [font-size:20px] font-semibold ${className}`}
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
    <div className="genre-tags flex [gap:5px] flex-wrap">
      {artist.genre ? (
        <>
          <span className="genre-tag [color:var(--text)] font-semibold">
            <Music2 size={12} />
            {artist.genre}
          </span>
          {artist.subgenres.map((genre) => (
            <span className="subgenre-tag [color:var(--secondary)]" key={genre}>
              {genre}
            </span>
          ))}
        </>
      ) : (
        <span className="muted [color:var(--secondary)] small text-xs [line-height:1.55]">
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
      <div className="set-unavailable flex items-center gap-2 [color:var(--secondary)] [font-size:11px] [padding:12px_0] [line-height:1.6]">
        <Disc3 size={17} />
        <span>{t.unavailable}</span>
      </div>
    );
  return (
    <a
      className={`set-link flex items-center gap-3 [border:1px_solid_var(--line)] [background:var(--panel-soft)] [border-radius:11px] [padding:13px] [min-height:66px] [transition:border-color_0.15s,_background_0.15s] ${compact ? 'compact-set' : ''}`}
      href={recording.youtubeUrl}
      target="_blank"
      rel="noreferrer"
    >
      <span className="play-icon grid [place-items:center] [width:35px] [height:35px] [border-radius:9px] [color:var(--red)] [background:color-mix(in_srgb,_var(--red)_9%,_transparent)] shrink-0">
        <Play size={compact ? 14 : 18} fill="currentColor" />
      </span>
      <span className="set-link-text flex flex-col gap-1 min-w-0">
        <strong>{recording.eventLabel}</strong>{' '}
        <span>
          {(representative ?? recording.representative) ? t.representative : recording.channel}
        </span>
      </span>
      <ArrowUpRight size={17} />
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
        <strong className="preview-name [font-size:17px] [letter-spacing:-0.02em]">
          {artist.name}
        </strong>
        {members.map((member) => (
          <section
            className="preview-member grid [gap:10px] pt-3 [border-top:1px_solid_var(--line)]"
            aria-label={member.name}
            key={member.id}
          >
            <div className="preview-member-heading flex gap-3 items-center">
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
            <span className="eyebrow [font-size:11px] font-semibold [letter-spacing:0.045em] muted [color:var(--secondary)]">
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
        <strong className="preview-name [font-size:17px] [letter-spacing:-0.02em]">
          {artist.name}
        </strong>
        <span className="eyebrow [font-size:11px] font-semibold [letter-spacing:0.045em] muted [color:var(--secondary)]">
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
}: {
  appearance: Appearance;
  language: Language;
  priority: Priority | null;
  onOpen: (id: string) => void;
}) {
  const artist = artistById.get(appearance.artistId);
  const isPresent = useIsPresent();
  const [preview, setPreview] = useState(false);
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
      className="chip-wrapper flex [flex:0_0_auto] [width:max-content] min-w-0 [max-width:100%]"
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
            className={`artist-chip flex w-full min-w-0 items-center min-h-8 [max-width:100%] [gap:3px] [padding:6px_9px] [font-size:11px] font-medium [line-height:1.5] text-left [border-radius:7px] [border:1px_solid_var(--line)] [background:var(--chip)] [color:var(--text)] [transition:background_0.15s,_border-color_0.15s,_box-shadow_0.15s] [cursor:grab] max-[1100px]:[font-size:10px] max-[1100px]:[padding:5px_7px] ${priority ? 'is-prioritized' : ''}`}
            ref={setNodeRef}
            style={{ transform: CSS.Translate.toString(transform) }}
            {...attributes}
            {...listeners}
            onFocus={() => setPreview(true)}
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
            <GripVertical
              size={12}
              className="chip-grip shrink-0 [color:var(--tertiary)] w-3 [opacity:0] [transition:opacity_0.12s]"
              aria-hidden="true"
            />
          </button>
        </HoverCard.Trigger>
        <HoverCard.Portal>
          <HoverCard.Content
            className="artist-preview w-72 [max-width:calc(100vw_-_24px)] [background:var(--panel)] [color:var(--text)] [border-radius:15px] overflow-hidden [box-shadow:var(--shadow)] [z-index:40] [animation:reveal_0.16s_ease-out] [max-height:min(520px,_calc(100dvh_-_32px))] overflow-y-auto max-[760px]:hidden"
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
      className="catalog-card min-w-0 flex items-center text-left gap-3 [min-height:83px] [padding:9px_10px] bg-transparent [border-radius:11px] [transition:background_0.15s] max-[760px]:[padding:10px_8px] max-[760px]:gap-3"
      data-artist-id={artist.id}
      onClick={() => onOpen(artist.id)}
    >
      <Portrait
        artist={artist}
        className="catalog-photo [width:55px] [height:55px] [border-radius:10px] shrink-0 max-[760px]:w-14 max-[760px]:h-14"
      />
      <span className="catalog-card-body flex flex-col [gap:5px] min-w-0">
        <strong>{artist.name}</strong>
        <span>{artist.genre ?? messages(language).unknownGenre}</span>
      </span>
      {prioritized ? (
        <Star
          size={17}
          className="selected-star [color:var(--orange)]"
          fill="currentColor"
          aria-label={messages(language).prioritized}
        />
      ) : (
        <ArrowUpRight size={17} className="catalog-open" />
      )}
    </motion.button>
  );
}
