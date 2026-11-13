import { messages } from '../../i18n';
import { GENRES } from '../../data/genres';
import type { Language } from '../../types';
import { MultiSelectFilter } from './multi-select-filter';
export function GenreFilter({
  language,
  selected,
  onChange,
  onResetAll,
  canReset,
}: {
  language: Language;
  selected: string[];
  onChange: (value: string[]) => void;
  onResetAll?: () => void;
  canReset?: boolean;
}) {
  return (
    <MultiSelectFilter
      language={language}
      label={language === 'en' ? 'Genres' : 'Gêneros'}
      allLabel={language === 'en' ? 'All genres' : 'Todos os gêneros'}
      clearLabel={language === 'en' ? 'Clear genres' : 'Limpar gêneros'}
      options={GENRES.map((value) => ({ value, label: value }))}
      notice={messages(language).genreWarning}
      selected={selected}
      onChange={onChange}
      onResetAll={onResetAll}
      canReset={canReset}
    />
  );
}
