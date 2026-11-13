import { publicAsset } from '../../utils/assets';
import { DisplaySettings } from './display-settings';
import { messages } from '../../i18n';
import { usePlanner } from '../../store/planner';
import type { Language } from '../../types';

function Brand({ language }: { language: Language }) {
  return (
    <a
      href={window.location.pathname}
      aria-label={`set.priority · ${messages(language).home}`}
      className="brand flex min-h-11 min-w-0 items-center gap-2.5 rounded-lg max-[22.5rem]:gap-2"
    >
      <img
        src={publicAsset('/logo.svg')}
        alt=""
        className="size-9 shrink-0 rounded-[23%] ring-1 ring-white/20 max-[47.5rem]:size-8"
      />
      <img
        src={publicAsset('/wordmark.svg')}
        alt="set.priority"
        width="167"
        height="35"
        className="wordmark h-7 w-auto shrink-0 max-[47.5rem]:h-6 max-[22.5rem]:h-5"
      />
    </a>
  );
}
export function SiteHeader({ language }: { language: Language }) {
  const t = messages(language);
  const setLanguage = usePlanner((s) => s.setLanguage);
  return (
    <header className="site-header border-b border-separator bg-canvas">
      <div className="header-inner mx-auto flex min-h-18 max-w-384 items-center justify-between gap-3 px-10 py-3 max-[68.75rem]:px-6 max-[47.5rem]:min-h-16 max-[47.5rem]:px-5 max-[47.5rem]:py-2 max-[22.5rem]:gap-2 max-[22.5rem]:px-4">
        <Brand language={language} />
        <div className="header-actions flex items-center gap-3 max-[47.5rem]:gap-1 max-[22.5rem]:[gap:0]">
          <fieldset
            className="language-control flex shrink-0 gap-0.5 rounded-lg bg-raised p-0.5 [&_button]:min-h-11 [&_button]:min-w-11 [&_button]:rounded-md [&_button]:bg-transparent [&_button]:text-xs [&_button]:font-semibold [&_button]:text-muted [&_button[aria-pressed=true]]:bg-[var(--hover)] [&_button[aria-pressed=true]]:text-content"
            aria-label={language === 'en' ? 'Language' : 'Idioma'}
          >
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
          <DisplaySettings language={language} />
        </div>
      </div>
    </header>
  );
}
