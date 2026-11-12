import { controlClassName } from '../ui/control';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, Check } from 'lucide-react';
import { GENRES } from '../../data/genres';
import type { Language } from '../../types';
export function GenreFilter({
  language,
  selected,
  onChange,
}: {
  language: Language;
  selected: string[];
  onChange: (value: string[]) => void;
}) {
  const label = language === 'en' ? 'Genres' : 'Gêneros';
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={`${controlClassName} inline-flex shrink-0 items-center gap-2 px-3 font-medium text-content hover:bg-raised`}
          aria-label={label}
        >
          {label}
          {selected.length > 0 && <span>{selected.length}</span>}
          <ChevronDown size="1rem" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 max-h-[min(70dvh,var(--radix-dropdown-menu-content-available-height))] min-w-56 overflow-y-auto rounded-xl border border-separator bg-surface p-2 shadow-xl"
          sideOffset={8}
          collisionPadding={12}
        >
          <DropdownMenu.Separator className="my-2 h-px bg-separator" />
          <DropdownMenu.Item
            onSelect={() => onChange([])}
            className="flex min-h-11 cursor-pointer items-center rounded-lg px-3 text-sm text-accent"
          >
            {language === 'en' ? 'Clear genres' : 'Limpar gêneros'}
          </DropdownMenu.Item>
          {GENRES.map((genre) => (
            <DropdownMenu.CheckboxItem
              key={genre}
              checked={selected.includes(genre)}
              onSelect={(event) => event.preventDefault()}
              onCheckedChange={(checked) =>
                onChange(
                  checked ? [...selected, genre] : selected.filter((value) => value !== genre)
                )
              }
              className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm outline-none data-[highlighted]:bg-raised"
            >
              <span className="size-4">
                <DropdownMenu.ItemIndicator>
                  <Check size="1rem" />
                </DropdownMenu.ItemIndicator>
              </span>
              {genre}
            </DropdownMenu.CheckboxItem>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
