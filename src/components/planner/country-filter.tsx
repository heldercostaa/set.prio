import { catalog, countriesFor } from '../../data';
import type { Language } from '../../types';
import { countryFlag, countryName, UNKNOWN_COUNTRY } from '../../utils/countries';
import { MultiSelectFilter } from './multi-select-filter';
export function CountryFilter({
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
  const countries = [...new Set(catalog.artists.flatMap(countriesFor))].sort((a, b) =>
    a === UNKNOWN_COUNTRY
      ? 1
      : b === UNKNOWN_COUNTRY
        ? -1
        : countryName(a, language).localeCompare(countryName(b, language), language)
  );
  return (
    <MultiSelectFilter
      language={language}
      label={language === 'en' ? 'Countries' : 'Países'}
      allLabel={language === 'en' ? 'All countries' : 'Todos os países'}
      clearLabel={language === 'en' ? 'Clear countries' : 'Limpar países'}
      options={countries.map((code) => ({
        value: code,
        label: `${countryFlag(code)} ${countryName(code, language)}`.trim(),
      }))}
      selected={selected}
      onChange={onChange}
      onResetAll={onResetAll}
      canReset={canReset}
    />
  );
}
