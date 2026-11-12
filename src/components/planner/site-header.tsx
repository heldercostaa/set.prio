import { publicAsset } from '../../utils/assets';
import { Code, Globe2 } from 'lucide-react';
import { messages } from '../../i18n';
import { usePlanner } from '../../store/planner';
import type { Language } from '../../types';

function Brand() {
  return (
    <div className="brand flex items-center [gap:13px] shrink-0 max-[760px]:[gap:10px] max-[360px]:gap-2">
      <img src={publicAsset('/logo.svg')} width={46} height={46} alt="" />
      <div>
        <div className="wordmark [font-size:27px] font-medium [letter-spacing:-1.2px] [line-height:1.06] max-[760px]:[font-size:24px] max-[360px]:[font-size:23px]">
          set<span>.</span>
          <strong>prio</strong>
        </div>
        <p>Tomorrowland Brasil 2027</p>
      </div>
    </div>
  );
}
export function SiteHeader({ language }: { language: Language }) {
  const t = messages(language);
  const setLanguage = usePlanner((s) => s.setLanguage);
  return (
    <header className="site-header [border-bottom:1px_solid_var(--line)] bg-surface">
      <div className="header-inner max-w-384 [margin:auto] [padding:18px_40px] flex items-center justify-between gap-4 max-[1100px]:[padding:20px_24px] max-[760px]:[padding:16px_20px] max-[760px]:gap-2 max-[360px]:p-4">
        <Brand />
        <div className="header-actions flex items-center gap-3 max-[760px]:gap-1 max-[360px]:[gap:0]">
          <fieldset
            className="language-control flex items-center [gap:3px] [font-size:11px] text-muted"
            aria-label={language === 'en' ? 'Language' : 'Idioma'}
          >
            <Globe2 size={15} />
            <button
              type="button"
              aria-pressed={language === 'en'}
              aria-label={t.english}
              onClick={() => setLanguage('en')}
            >
              EN
            </button>
            <button
              type="button"
              aria-pressed={language === 'pt-BR'}
              aria-label={t.portuguese}
              onClick={() => setLanguage('pt-BR')}
            >
              PT
            </button>
          </fieldset>
          <a
            className="icon-button w-11 h-11 inline-flex items-center justify-center bg-transparent text-muted [border-radius:10px] shrink-0 github-link"
            href="https://github.com/heldercostaa/set.prio"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
          >
            <Code size={19} />
          </a>
        </div>
      </div>
    </header>
  );
}
