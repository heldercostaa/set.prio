import { GENRES } from '../../data/genres';
import type { Language } from '../../types';
import { MultiSelectFilter } from './multi-select-filter';
export function GenreFilter({
  language,
  selected,
  onChange,
}: {
  language: Language;
  selected: string[];
  onChange: (value: string[]) => void;
}) {
  return (
    <MultiSelectFilter
      language={language}
      label={language === 'en' ? 'Genres' : 'Gêneros'}
      allLabel={language === 'en' ? 'All genres' : 'Todos os gêneros'}
      clearLabel={language === 'en' ? 'Clear genres' : 'Limpar gêneros'}
      options={GENRES.map((value) => ({ value, label: value }))}
      selected={selected}
      onChange={onChange}
    />
  );
}
