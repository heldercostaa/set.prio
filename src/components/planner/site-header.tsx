import { publicAsset } from '../../utils/assets';
import { Code, Globe2 } from 'lucide-react';
import { messages } from '../../i18n';
import { usePlanner } from '../../store/planner';
import type { Language } from '../../types';

function Brand() {
  return (
    <div className="brand flex items-center gap-3.25 shrink-0 max-[47.5rem]:gap-2.5 max-[22.5rem]:gap-2 [&_img]:block [&_img]:[border-radius:23%] [&_img]:[box-shadow:0_0_0_0.0625rem_#ffffff40,_0_0.1875rem_0.625rem_#0008] [&_p]:[font-size:0.6875rem] [&_p]:text-muted [&_p]:mt-1.25 [&_p]:[letter-spacing:0.005em] max-[47.5rem]:[&_img]:w-10 max-[47.5rem]:[&_img]:h-10 max-[47.5rem]:[&_p]:[font-size:0.5625rem] max-[22.5rem]:[&_p]:[font-size:0.5rem] max-[22.5rem]:[&_img]:w-9 max-[22.5rem]:[&_img]:h-9">
      <img src={publicAsset('/logo.svg')} width={46} height={46} alt="" />
      <div>
        <div className="wordmark [font-size:1.6875rem] font-medium [letter-spacing:-0.075rem] [line-height:1.06] max-[47.5rem]:[font-size:1.5rem] max-[22.5rem]:[font-size:1.4375rem] [&_>_span]:[color:#ff453a] [&_strong]:font-bold">
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
      <div className="header-inner max-w-384 [margin:auto] [padding:1.125rem_2.5rem] flex items-center justify-between gap-4 max-[68.75rem]:[padding:1.25rem_1.5rem] max-[47.5rem]:[padding:1rem_1.25rem] max-[47.5rem]:gap-2 max-[22.5rem]:p-4">
        <Brand />
        <div className="header-actions flex items-center gap-3 max-[47.5rem]:gap-1 max-[22.5rem]:[gap:0]">
          <fieldset
            className="language-control flex items-center gap-0.75 [font-size:0.6875rem] text-muted [&_>_svg]:mr-1.25 [&_button]:[min-width:2.1875rem] [&_button]:min-h-11 [&_button]:rounded-lg [&_button]:bg-transparent [&_button]:font-semibold [&_button]:text-muted [&_button[aria-pressed='true']]:text-content [&_button[aria-pressed='true']]:[background:var(--hover)] max-[47.5rem]:[&_>_svg]:hidden max-[47.5rem]:[&_button]:[min-width:2.75rem] max-[47.5rem]:[&_button]:min-h-11 max-[47.5rem]:[&_button]:[font-size:0.625rem] max-[22.5rem]:[&_button]:[min-width:1.6875rem] max-[47.5rem]:[&_button]:w-11"
            aria-label={language === 'en' ? 'Language' : 'Idioma'}
          >
            <Globe2 size="0.9375rem" />
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
            <Code size="1.1875rem" />
          </a>
        </div>
      </div>
    </header>
  );
}
