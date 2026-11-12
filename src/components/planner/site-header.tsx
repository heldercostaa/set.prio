import { publicAsset } from '../../utils/assets';
import { Code, Globe2 } from 'lucide-react';
import { messages } from '../../i18n';
import { usePlanner } from '../../store/planner';
import type { Language } from '../../types';

function Brand() {
  return (
    <div className="brand flex items-center gap-3.25 shrink-0 max-[47.5rem]:gap-2.5 max-[22.5rem]:gap-2">
      <img src={publicAsset('/logo.svg')} width={46} height={46} alt="" />
      <div>
        <div className="wordmark [font-size:1.6875rem] font-medium [letter-spacing:-0.075rem] [line-height:1.06] max-[47.5rem]:[font-size:1.5rem] max-[22.5rem]:[font-size:1.4375rem]">
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
    <header className="site-header [border-bottom:0.0625rem_solid_var(--line)] bg-surface">
      <div className="header-inner max-w-384 [margin:auto] [padding:1.125rem_40px] flex items-center justify-between gap-4 max-[68.75rem]:[padding:1.25rem_24px] max-[47.5rem]:[padding:1rem_20px] max-[47.5rem]:gap-2 max-[22.5rem]:p-4">
        <Brand />
        <div className="header-actions flex items-center gap-3 max-[47.5rem]:gap-1 max-[22.5rem]:[gap:0]">
          <fieldset
            className="language-control flex items-center gap-0.75 [font-size:0.6875rem] text-muted"
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
            className="icon-button w-11 h-11 inline-flex items-center justify-center bg-transparent text-muted rounded-2.5 shrink-0 github-link"
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
