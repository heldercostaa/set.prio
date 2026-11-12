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
      <div className="about-body p-6">
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
              className="source-link inline-flex items-center gap-1 text-accent [font-size:0.625rem] [margin:0.25rem_0.75rem_0_0] [overflow-wrap:anywhere] [max-width:100%]"
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
