import { publicAsset } from '../../utils/assets';
import { Code } from 'lucide-react';
import { messages } from '../../i18n';
import { usePlanner } from '../../store/planner';
import type { Language } from '../../types';

function Brand() {
  return (
    <div className="brand flex min-w-0 items-center gap-2.5">
      <img
        src={publicAsset('/logo.svg')}
        alt=""
        className="size-9 shrink-0 rounded-[23%] ring-1 ring-white/20"
      />
      <div className="wordmark whitespace-nowrap text-2xl font-medium leading-none tracking-[-0.06em] max-[22.5rem]:text-xl">
        set<span className="text-[#ff453a]">.</span>
        <strong className="font-bold">priority</strong>
      </div>
    </div>
  );
}
export function SiteHeader({ language }: { language: Language }) {
  const t = messages(language);
  const setLanguage = usePlanner((s) => s.setLanguage);
  return (
    <header className="site-header border-b border-separator bg-canvas">
      <div className="header-inner mx-auto flex min-h-18 max-w-384 items-center justify-between gap-3 px-10 py-3 max-[68.75rem]:px-6 max-[47.5rem]:px-5 max-[22.5rem]:gap-2 max-[22.5rem]:px-4">
        <Brand />
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
          <a
            className="icon-button w-11 h-11 inline-flex items-center justify-center bg-transparent text-muted rounded-xl shrink-0 github-link hover:[background:var(--hover)] hover:text-content max-[47.5rem]:hidden"
            href="https://github.com/heldercostaa/set.prio"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
          >
            <Code size="1.125rem" />
          </a>
        </div>
      </div>
    </header>
  );
}
