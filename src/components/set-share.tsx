import {
  ChevronDown,
  Download,
  FileText,
  Image as ImageIcon,
  LoaderCircle,
  Share,
} from 'lucide-react';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { appearancesFor, artistById, membersFor, recordingById } from '../data';
import { dayName, messages, priorityHasCode, priorityLabel } from '../i18n';
import { usePlanner } from '../store/planner';
import { downloadBlob } from '../utils/exports';
import { artistNotes } from '../utils/artist-notes';
import { setImage } from '../utils/set-image';
import { Modal } from './ui/modal';

interface ShareRequest {
  artistId: string;
  recordingId: string;
}
const ShareContext = createContext<
  ((request: ShareRequest, trigger: HTMLElement | null) => void) | null
>(null);
export function useSetShare() {
  const share = useContext(ShareContext);
  if (!share) throw new Error('Set sharing provider missing');
  return share;
}

export function SetShareProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<ShareRequest | null>(null);
  const trigger = useRef<HTMLElement | null>(null);
  return (
    <ShareContext.Provider
      value={(next, source) => {
        trigger.current = source;
        setRequest(next);
      }}
    >
      {children}
      {request && (
        <SetShareDialog
          key={`${request.artistId}:${request.recordingId}`}
          request={request}
          onClose={() => setRequest(null)}
          restoreFocus={() => {
            if (trigger.current?.isConnected) trigger.current.focus();
            else document.getElementById('board-view')?.focus();
          }}
        />
      )}
    </ShareContext.Provider>
  );
}

function SetShareDialog({
  request,
  onClose,
  restoreFocus,
}: {
  request: ShareRequest;
  onClose: () => void;
  restoreFocus: () => void;
}) {
  const state = usePlanner();
  const t = messages(state.language);
  const artist = artistById.get(request.artistId);
  const recording = recordingById.get(request.recordingId);
  const rating = state.ratings[request.recordingId];
  const notes = artist ? artistNotes(artist, state.comments) : '';
  const appearances = artist
    ? appearancesFor(artist).flatMap((appearance) => {
        const priority = state.priorities[appearance.id];
        return priority ? [{ ...appearance, priority }] : [];
      })
    : [];
  const [appearanceId, setAppearanceId] = useState(
    appearances.find((appearance) => appearance.day === state.activeDay)?.id ??
      appearances[0]?.id ??
      ''
  );
  const [includePriority, setIncludePriority] = useState(appearances.length > 0);
  const selectedPriority = state.priorities[appearanceId];
  const priority = includePriority ? selectedPriority : null;
  const generationKey = JSON.stringify([
    request.artistId,
    request.recordingId,
    rating,
    state.language,
    state.showArtistFlags,
    priority,
    notes,
  ]);
  const [generated, setGenerated] = useState<{ file: File; url: string; key: string } | null>(null);
  const prepared = generated?.key === generationKey ? generated : null;
  const [error, setError] = useState('');
  const [sharing, setSharing] = useState(false);
  useEffect(() => {
    let active = true;
    let pendingUrl: string | undefined;
    setError('');
    if (artist && recording && rating != null) {
      void setImage({
        artist,
        recording,
        rating,
        language: state.language,
        priority,
        notes,
        members: membersFor(artist),
        showFlags: state.showArtistFlags !== false,
      })
        .then(async (blob) => {
          if (!active) return;
          const slug = artist.id.replace(/[^a-z0-9-]/gi, '-');
          const file = new File([blob], `set.priority-${slug}-rating.png`, { type: 'image/png' });
          pendingUrl = URL.createObjectURL(file);
          const decoded = new Image();
          decoded.src = pendingUrl;
          await decoded.decode();
          if (!active) return;
          setGenerated({ file, url: pendingUrl, key: generationKey });
          pendingUrl = undefined;
        })
        .catch(() => {
          if (active) setError(t.shareImageError);
        });
    }
    return () => {
      active = false;
      if (pendingUrl) URL.revokeObjectURL(pendingUrl);
    };
  }, [
    artist,
    recording,
    rating,
    state.language,
    state.showArtistFlags,
    priority,
    t.shareImageError,
    generationKey,
    notes,
  ]);
  useEffect(() => {
    return () => {
      if (generated) URL.revokeObjectURL(generated.url);
    };
  }, [generated]);
  let canShare = false;
  if (generated && typeof navigator.share === 'function') {
    try {
      canShare = navigator.canShare?.({ files: [generated.file] }) ?? false;
    } catch {
      canShare = false;
    }
  }
  const share = async () => {
    if (!prepared || !artist || !recording) return;
    setSharing(true);
    setError('');
    try {
      await navigator.share({
        files: [prepared.file],
        title: `${artist.name} · ${t.shareRatingLabel}`,
        text: `${artist.name} · ${new Intl.NumberFormat(state.language).format(rating ?? 0)}/10\n${recording.eventLabel}${notes.trim() ? `\n\n${notes.trim()}` : ''}\n${recording.youtubeUrl}`,
      });
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError'))
        setError(t.imageShareFailed);
    } finally {
      setSharing(false);
    }
  };
  return (
    <Modal
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={t.shareSet}
      description={`${artist?.name ?? ''} · ${recording?.eventLabel ?? ''}`}
      closeLabel={t.close}
      onRestoreFocus={restoreFocus}
      className="min-[47.5rem]:[width:min(62rem,_calc(100vw_-_3rem))]"
    >
      <div className="min-h-0 overflow-y-auto min-[47.5rem]:grid min-[47.5rem]:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0 bg-[#111113] p-5 min-[47.5rem]:p-7">
          <div className="mb-4 flex items-center justify-between gap-3 text-xs text-muted">
            <span className="flex items-center gap-2 font-medium">
              <ImageIcon size={15} />
              {t.sharePreview}
            </span>
            <span className="rounded-md border border-white/10 px-2 py-1 text-[10px] tracking-wider">
              PNG · 1080 px
            </span>
          </div>
          <div
            aria-busy={!prepared && !error}
            className="relative flex min-h-48 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-[0_12px_40px_#0005]"
          >
            {rating == null ? (
              <p role="status" className="p-6 text-sm text-muted">
                {t.rateBeforeSharing}
              </p>
            ) : generated ? (
              <img
                src={generated.url}
                alt={`${t.shareRatingLabel} · ${artist?.name} · ${new Intl.NumberFormat(state.language).format(rating)}/10`}
                className="max-h-[38dvh] w-full object-contain min-[47.5rem]:max-h-[62dvh]"
              />
            ) : (
              <p
                role="status"
                className="flex min-h-64 items-center justify-center gap-2 p-6 text-sm text-muted"
              >
                {!error && <LoaderCircle className="size-5 motion-safe:animate-spin" />}
                {error || t.imagePreparing}
              </p>
            )}
            {generated && !prepared && !error && (
              <span
                role="status"
                className="absolute right-3 top-3 flex items-center gap-2 rounded-lg bg-surface/95 px-3 py-2 text-xs text-muted shadow-lg"
              >
                <LoaderCircle className="size-3.5 motion-safe:animate-spin" />
                {t.imagePreparing}
              </span>
            )}
          </div>
        </div>
        {rating != null && (
          <aside className="min-w-0 border-t border-separator p-5 min-[47.5rem]:border-t-0 min-[47.5rem]:border-l min-[47.5rem]:p-6">
            <h3 className="text-sm font-semibold">{t.shareDetails}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">{t.shareDetailsHint}</p>
            {appearances.length > 0 && (
              <div className="mt-5 rounded-xl border border-separator bg-raised p-3.5">
                <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 text-sm">
                  <span>{t.includePriority}</span>
                  <span className="relative shrink-0">
                    <input
                      type="checkbox"
                      aria-label={t.includePriority}
                      checked={includePriority}
                      onChange={(event) => setIncludePriority(event.target.checked)}
                      className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                    />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none block h-6 w-10 rounded-full bg-muted/30 transition-colors peer-checked:bg-content peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-focus motion-reduce:transition-none"
                    />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute left-1 top-1 size-4 rounded-full bg-content peer-checked:bg-surface shadow-sm transition-transform peer-checked:translate-x-4 motion-reduce:transition-none"
                    />
                  </span>
                </label>
                {selectedPriority && (
                  <p
                    className={`mt-1 w-fit rounded-md border px-2 py-1 text-xs font-medium [color:var(--priority)] [border-color:color-mix(in_srgb,var(--priority)_20%,transparent)] [background:color-mix(in_srgb,var(--priority)_9%,transparent)] priority-${selectedPriority.toLowerCase()} ${includePriority ? '' : 'opacity-40'}`}
                  >
                    {priorityHasCode(selectedPriority) && `${selectedPriority} | `}
                    {priorityLabel(selectedPriority, state.language)}
                  </p>
                )}
                {appearances.length > 1 && (
                  <label className="mt-4 flex min-w-0 flex-col gap-2 text-xs text-muted">
                    {t.priorityFrom}
                    <span className="relative block min-w-0 w-full">
                      <select
                        disabled={!includePriority}
                        className="h-11 w-full appearance-none truncate rounded-lg border border-separator bg-surface py-2.5 pr-10 pl-3 text-sm leading-5 text-content disabled:opacity-40"
                        value={appearanceId}
                        onChange={(event) => setAppearanceId(event.target.value)}
                      >
                        {appearances.map((appearance) => (
                          <option key={appearance.id} value={appearance.id}>
                            {dayName(appearance.day, state.language)} ·{' '}
                            {priorityLabel(appearance.priority, state.language)}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        aria-hidden="true"
                        size={16}
                        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted"
                      />
                    </span>
                  </label>
                )}
              </div>
            )}
            {notes.trim() && (
              <div className="mt-4 rounded-xl border border-separator p-3.5">
                <p className="flex items-start gap-2 text-xs leading-relaxed text-muted">
                  <FileText size={16} className="mt-0.5 shrink-0" />
                  {t.shareNotesIncluded}
                </p>
                <p className="mt-3 line-clamp-3 whitespace-pre-line break-words text-xs leading-relaxed">
                  {notes.trim()}
                </p>
              </div>
            )}
          </aside>
        )}
      </div>
      <div className="shrink-0 border-t border-separator bg-surface px-5 py-4 min-[47.5rem]:flex min-[47.5rem]:items-center min-[47.5rem]:justify-between min-[47.5rem]:gap-6 min-[47.5rem]:px-7">
        <p className="mb-3 text-xs leading-relaxed text-muted min-[47.5rem]:mb-0 min-[47.5rem]:max-w-72">
          {!canShare && generated ? t.downloadSetHint : t.shareDetailsHint}
        </p>
        <div className="flex gap-2 min-[47.5rem]:gap-3">
          {canShare && (
            <button
              type="button"
              aria-label={t.shareImage}
              disabled={sharing || !prepared}
              onClick={() => void share()}
              className="inline-flex min-h-11 min-w-0 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-content px-3 text-xs font-semibold text-surface disabled:opacity-50 min-[47.5rem]:flex-none min-[47.5rem]:px-5 min-[47.5rem]:text-sm [&_svg]:shrink-0"
            >
              {sharing ? (
                <LoaderCircle size={17} className="motion-safe:animate-spin" />
              ) : (
                <Share size={17} />
              )}
              <span className="min-[47.5rem]:hidden">{t.shareAction}</span>
              <span className="hidden min-[47.5rem]:inline">{t.shareImage}</span>
            </button>
          )}
          <button
            type="button"
            aria-label={t.image}
            disabled={!prepared}
            onClick={() => {
              if (prepared) downloadBlob(prepared.file, prepared.file.name);
            }}
            className={`inline-flex min-h-11 min-w-0 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl border px-3 text-xs font-semibold disabled:opacity-50 min-[47.5rem]:flex-none min-[47.5rem]:px-5 min-[47.5rem]:text-sm [&_svg]:shrink-0 ${canShare ? 'border-separator bg-raised text-content' : 'border-transparent bg-content text-surface'}`}
          >
            <Download size={17} />
            <span className="min-[47.5rem]:hidden">{t.downloadAction}</span>
            <span className="hidden min-[47.5rem]:inline">{t.image}</span>
          </button>
        </div>
        {error && (
          <p role="alert" className="mt-3 text-xs text-accent">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}
