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
      className={`portrait ${className}`}
      src={publicAsset(artist.photoUrl)}
      alt={artist.name}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  ) : (
    <div className={`portrait portrait-fallback ${className}`} aria-hidden="true">
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
    <div className="genre-tags">
      {artist.genre ? (
        <>
          <span className="genre-tag">
            <Music2 size={12} />
            {artist.genre}
          </span>
          {artist.subgenres.map((genre) => (
            <span className="subgenre-tag" key={genre}>
              {genre}
            </span>
          ))}
        </>
      ) : (
        <span className="muted small">{messages(language).unknownGenre}</span>
      )}
    </div>
  );
}
export function SetLink({
  recording,
  language,
  compact = false,
  representative,
  artistName,
}: {
  recording: Recording | undefined;
  language: Language;
  compact?: boolean;
  representative?: boolean;
  artistName?: string;
}) {
  const t = messages(language);
  if (!recording)
    return (
      <div className="set-unavailable">
        <Disc3 size={17} />
        <span>
          {artistName && <strong>{artistName} · </strong>}
          {t.unavailable}
        </span>
      </div>
    );
  return (
    <a
      className={`set-link ${compact ? 'compact-set' : ''}`}
      href={recording.youtubeUrl}
      aria-label={
        artistName
          ? `${artistName} · ${recording.eventLabel} · YouTube${(representative ?? recording.representative) ? ` · ${t.representative}` : ''}`
          : undefined
      }
      target="_blank"
      rel="noreferrer"
    >
      <span className="play-icon">
        <Play size={compact ? 14 : 18} fill="currentColor" />
      </span>
      <span className="set-link-text">
        {artistName && <span className="set-artist-name">{artistName}</span>}
        <strong>{recording.eventLabel}</strong>{' '}
        <span>
          {(representative ?? recording.representative) ? t.representative : recording.channel}
        </span>
      </span>
      <ArrowUpRight size={17} />
    </a>
  );
}
export function MemberSetLinks({ members, language }: { members: Artist[]; language: Language }) {
  const t = messages(language);
  return (
    <section className="member-set-links" aria-label={t.youtubeSets}>
      <h3>{t.youtubeSets}</h3>
      {members.map((member) => (
        <SetLink
          key={member.id}
          artistName={member.name}
          recording={
            member.recommendedSetId ? recordingById.get(member.recommendedSetId) : undefined
          }
          language={language}
          representative={member.recommendedSetRepresentative}
          compact
        />
      ))}
    </section>
  );
}
function Preview({ artist, language }: { artist: Artist; language: Language }) {
  const recording = artist.recommendedSetId
    ? recordingById.get(artist.recommendedSetId)
    : undefined;
  const members = membersFor(artist);
  if (members.length)
    return (
      <div className="preview-body">
        <strong className="preview-name">{artist.name}</strong>
        <MemberSetLinks members={members} language={language} />
        {members.map((member) => (
          <section className="preview-member" aria-label={member.name} key={member.id}>
            <div className="preview-member-heading">
              <Portrait artist={member} />
              <div>
                <strong>{member.name}</strong>
                <Genres artist={member} language={language} />
              </div>
            </div>
          </section>
        ))}
        {recording && !(artist.recommendedSetRepresentative ?? recording.representative) && (
          <>
            <span className="eyebrow muted">{messages(language).jointRecording}</span>
            <SetLink recording={recording} language={language} compact />
          </>
        )}
      </div>
    );
  return (
    <>
      <Portrait artist={artist} className="preview-photo" />
      <div className="preview-body">
        <strong className="preview-name">{artist.name}</strong>
        <span className="eyebrow muted">{messages(language).genreShort}</span>
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
      className="chip-wrapper"
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
            className={`artist-chip ${priority ? 'is-prioritized' : ''}`}
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
            <GripVertical size={12} className="chip-grip" aria-hidden="true" />
          </button>
        </HoverCard.Trigger>
        <HoverCard.Portal>
          <HoverCard.Content
            className="artist-preview"
            side="top"
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
      className="catalog-card"
      data-artist-id={artist.id}
      onClick={() => onOpen(artist.id)}
    >
      <Portrait artist={artist} className="catalog-photo" />
      <span className="catalog-card-body">
        <strong>{artist.name}</strong>
        <span>{artist.genre ?? messages(language).unknownGenre}</span>
      </span>
      {prioritized ? (
        <Star
          size={17}
          className="selected-star"
          fill="currentColor"
          aria-label={messages(language).prioritized}
        />
      ) : (
        <ArrowUpRight size={17} className="catalog-open" />
      )}
    </motion.button>
  );
}
