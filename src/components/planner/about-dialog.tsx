import { ArrowUpRight, LockKeyhole, ShieldCheck } from 'lucide-react';
import { Modal } from '../../components/ui/modal';
import { catalog } from '../../data';
import { longDate, messages } from '../../i18n';
import type { Language } from '../../types';

export function AboutDialog({
  language,
  open,
  onOpenChange,
}: {
  language: Language;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = messages(language);
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="set.prio"
      description="Tomorrowland Brasil 2027"
      closeLabel={t.close}
      className="about-modal"
    >
      <div className="about-body p-6 [overflow-y:auto] [overscroll-behavior:contain] [&_section]:pb-6 [&_section]:mb-6 [&_section]:[border-bottom:0.0625rem_solid_var(--line)] [&_section:last-child]:[padding-bottom:0] [&_section:last-child]:[margin-bottom:0] [&_section:last-child]:border-0 [&_section_>_svg]:text-accent [&_section_>_svg]:mb-3 [&_h3]:[font-size:0.9375rem] [&_h3]:font-semibold [&_h3]:[letter-spacing:-0.02em] [&_h3]:mb-2.5 [&_p]:text-xs [&_p]:[line-height:1.75] [&_p]:text-muted [&_p]:mb-2.5 [&_.small]:[font-size:0.625rem] max-[47.5rem]:p-5">
        <section>
          <LockKeyhole size="1.375rem" />
          <h3>{t.localTitle}</h3>
          <p>{t.localBody}</p>
        </section>
        <section>
          <ShieldCheck size="1.375rem" />
          <h3>{t.dataTitle}</h3>
          <p>{t.dataBody}</p>
          <p className="small text-xs [line-height:1.55] muted text-muted">
            {t.checked}: {longDate(catalog.verifiedAt, language)} · {catalog.appearances.length}{' '}
            {t.performances}
          </p>
          {catalog.sources.map((url) => (
            <a
              className="source-link inline-flex items-center gap-1 text-accent [font-size:0.625rem] [margin:0.25rem_0.75rem_0_0] [overflow-wrap:anywhere] [max-width:100%] max-[47.5rem]:min-h-11 max-[47.5rem]:items-center"
              href={url}
              target="_blank"
              rel="noreferrer"
              key={url}
            >
              {new URL(url).hostname}
              <ArrowUpRight size="0.75rem" />
            </a>
          ))}
        </section>
      </div>
    </Modal>
  );
}
