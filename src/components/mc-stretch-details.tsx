import { ExternalLink } from 'lucide-react';
import { messages } from '../i18n';
import type { Artist, Language } from '../types';
import { Portrait } from './artist';
import { ArtistNationality } from './artist-nationality';
import { Modal } from './ui/modal';
import { McStretchPhrases } from './mc-stretch-phrases';

export function McStretchDetails({
  artist,
  language,
  onClose,
  restoreFocus,
}: {
  artist: Artist;
  language: Language;
  onClose: () => void;
  restoreFocus: () => void;
}) {
  const t = messages(language);
  return (
    <Modal
      open
      title={artist.name}
      description="Tomorrowland Brasil 2027"
      closeLabel={t.close}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      onRestoreFocus={restoreFocus}
      className="artist-modal mc-stretch-details mc-stretch-fractured-surface"
    >
      <div className="artist-modal-scroll overflow-y-auto overscroll-contain">
        <Portrait
          artist={artist}
          landscape
          className="artist-hero h-57.5 w-full max-[47.5rem]:h-50"
        />
        <div className="artist-detail-body px-6 pb-5 pt-5.5 max-[47.5rem]:p-5">
          <div className="mb-4">
            <ArtistNationality artist={artist} language={language} expanded />
          </div>
          <div className="detail-section border-t border-separator py-5">
            <McStretchPhrases />
          </div>
          {artist.officialUrl && (
            <div className="border-t border-separator pt-2">
              <a
                href={artist.officialUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-2 text-xs text-accent"
              >
                {t.source}
                <ExternalLink size="0.875rem" aria-hidden="true" />
              </a>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
