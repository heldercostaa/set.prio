import { ArrowUpRight } from 'lucide-react';
import { messages } from '../../i18n';
import type { Language } from '../../types';

export function SiteFooter({ language, onAbout }: { language: Language; onAbout: () => void }) {
  const t = messages(language);
  return (
    <footer className="site-footer [margin:0_auto] max-w-364 [padding:1.375rem_0_30px] [border-top:0.0625rem_solid_var(--line)] flex justify-between gap-4 text-muted [font-size:0.625rem] min-[96.0625rem]:max-w-364 max-[96rem]:ml-10 max-[96rem]:mr-10 max-[68.75rem]:ml-6 max-[68.75rem]:mr-6 max-[47.5rem]:[margin:0_20px] max-[47.5rem]:[padding:1.25rem_0] max-[47.5rem]:flex-col max-[47.5rem]:gap-2.5 max-[47.5rem]:[font-size:0.625rem]">
      <div>
        <span>
          {t.createdBy}{' '}
          <a href="https://github.com/heldercostaa" target="_blank" rel="noreferrer">
            Helder Costa
            <ArrowUpRight size="0.75rem" />
          </a>
        </span>
        <span className="footer-note [color:var(--tertiary)] max-[47.5rem]:[font-size:0.5625rem]">
          {t.officialNote}
        </span>
      </div>
      <div>
        <a href="https://github.com/heldercostaa/set.prio" target="_blank" rel="noreferrer">
          GitHub <ArrowUpRight size="0.75rem" />
        </a>
        <a
          href="https://brasil.tomorrowland.com/pt/line-up/?page=artists"
          target="_blank"
          rel="noreferrer"
        >
          {t.source}
          <ArrowUpRight size="0.75rem" />
        </a>
        <button type="button" onClick={onAbout}>
          {t.sources}
        </button>
      </div>
    </footer>
  );
}
