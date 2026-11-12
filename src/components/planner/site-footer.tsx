import { ArrowUpRight } from 'lucide-react';
import { messages } from '../../i18n';
import type { Language } from '../../types';

export function SiteFooter({ language, onAbout }: { language: Language; onAbout: () => void }) {
  const t = messages(language);
  return (
    <footer className="site-footer [margin:0_auto] max-w-364 [padding:22px_0_30px] [border-top:1px_solid_var(--line)] flex justify-between gap-4 text-muted [font-size:10px] min-[1537px]:max-w-364 max-[1536px]:ml-10 max-[1536px]:mr-10 max-[1100px]:ml-6 max-[1100px]:mr-6 max-[760px]:[margin:0_20px] max-[760px]:[padding:20px_0] max-[760px]:flex-col max-[760px]:[gap:10px] max-[760px]:[font-size:10px]">
      <div>
        <span>
          {t.createdBy}{' '}
          <a href="https://github.com/heldercostaa" target="_blank" rel="noreferrer">
            Helder Costa
            <ArrowUpRight size={12} />
          </a>
        </span>
        <span className="footer-note [color:var(--tertiary)] max-[760px]:[font-size:9px]">
          {t.officialNote}
        </span>
      </div>
      <div>
        <a href="https://github.com/heldercostaa/set.prio" target="_blank" rel="noreferrer">
          GitHub <ArrowUpRight size={12} />
        </a>
        <a
          href="https://brasil.tomorrowland.com/pt/line-up/?page=artists"
          target="_blank"
          rel="noreferrer"
        >
          {t.source}
          <ArrowUpRight size={12} />
        </a>
        <button type="button" onClick={onAbout}>
          {t.sources}
        </button>
      </div>
    </footer>
  );
}
