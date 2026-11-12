import { controlClassName, controlCountClassName, menuMotionClassName } from '../ui/control';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, Check, RotateCcw } from 'lucide-react';
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
          className={`${controlClassName} group inline-flex shrink-0 items-center gap-2 px-3 font-medium text-content hover:bg-raised`}
          aria-label={label}
        >
          {label}
          {selected.length > 0 && <span className={controlCountClassName}>{selected.length}</span>}
          <ChevronDown
            size="1rem"
            className="transition-transform duration-150 group-data-[state=open]:rotate-180 motion-reduce:transition-none"
          />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={`${menuMotionClassName} z-50 flex max-h-[min(70dvh,var(--radix-dropdown-menu-content-available-height))] w-64 max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-2xl bg-surface text-control text-content shadow-[var(--shadow)] inset-ring inset-ring-separator`}
          align="start"
          sideOffset={8}
          collisionPadding={12}
        >
          <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3">
            <DropdownMenu.Label className="font-semibold">{label}</DropdownMenu.Label>
            <span className="text-xs font-normal tabular-nums text-muted">
              {selected.length > 0
                ? `${selected.length} ${language === 'en' ? 'selected' : selected.length === 1 ? 'selecionado' : 'selecionados'}`
                : language === 'en'
                  ? 'All genres'
                  : 'Todos os gêneros'}
            </span>
          </div>
          <DropdownMenu.Separator className="mx-3 h-px shrink-0 bg-separator" />
          <DropdownMenu.Group className="min-h-0 overflow-y-auto overscroll-contain p-1.5">
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
                className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-lg px-2.5 outline-none transition-colors data-[highlighted]:bg-raised data-[state=checked]:bg-accent/10"
              >
                {genre}
                <span className="flex size-4 shrink-0 items-center justify-center text-accent">
                  <DropdownMenu.ItemIndicator>
                    <Check className="size-4" strokeWidth={2.5} />
                  </DropdownMenu.ItemIndicator>
                </span>
              </DropdownMenu.CheckboxItem>
            ))}
          </DropdownMenu.Group>
          <DropdownMenu.Separator className="mx-3 h-px shrink-0 bg-separator" />
          <div className="shrink-0 p-1.5">
            <DropdownMenu.Item
              disabled={selected.length === 0}
              onSelect={() => onChange([])}
              className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-accent outline-none transition-colors data-[highlighted]:bg-raised data-[disabled]:cursor-default data-[disabled]:text-muted data-[disabled]:opacity-60"
            >
              <RotateCcw className="size-4 shrink-0" />
              {language === 'en' ? 'Clear genres' : 'Limpar gêneros'}
            </DropdownMenu.Item>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
