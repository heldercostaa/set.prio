import { useSheetSwipe } from './use-sheet-swipe';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useRef, type ReactNode } from 'react';
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  closeLabel: string;
  children: ReactNode;
  className?: string;
  onRestoreFocus?: () => void;
}
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  closeLabel,
  children,
  className = '',
  onRestoreFocus,
}: Props) {
  const content = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const closing = useRef(false);
  const requestClose = async (nextOpen: boolean) => {
    if (nextOpen || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onOpenChange(nextOpen);
      return;
    }
    if (closing.current) return;
    closing.current = true;
    try {
      const mobile = window.matchMedia('(width < 47.5rem)').matches;
      overlay.current?.animate(
        [
          { opacity: overlay.current ? getComputedStyle(overlay.current).opacity : 1 },
          { opacity: 0 },
        ],
        {
          duration: mobile ? 180 : 140,
          fill: 'forwards',
        }
      );
      await content.current?.animate(
        mobile
          ? [
              { translate: content.current ? getComputedStyle(content.current).translate : '0 0' },
              { translate: '0 100%' },
            ]
          : [
              { opacity: 1, scale: 1 },
              { opacity: 0, scale: 0.98 },
            ],
        { duration: mobile ? 180 : 140, easing: 'ease-in', fill: 'forwards' }
      ).finished;
      onOpenChange(false);
    } catch {
      // Unmounting cancels the animation; its owner has already closed the sheet.
    } finally {
      closing.current = false;
    }
  };
  const swipeHandlers = useSheetSwipe(content, overlay, () => void requestClose(false));
  return (
    <Dialog.Root open={open} onOpenChange={(value) => void requestClose(value)}>
      <Dialog.Portal>
        <Dialog.Overlay
          ref={overlay}
          className="modal-overlay fixed [inset:0] [background:#0007]  [z-index:90] [animation:overlay-in_0.18s_ease-out]"
        />
        <Dialog.Content
          ref={content}
          className={`modal fixed [top:50%] [left:50%] [transform:translate(-50%,_-50%)] [z-index:91] [width:min(37.5rem,_calc(100vw_-_2.5rem))] [max-height:min(90dvh,_58.75rem)] border border-separator rounded-2xl bg-surface [box-shadow:0_1.75rem_6.25rem_#0005] flex flex-col overflow-hidden text-content [animation:modal-in_0.18s_ease-out] max-[47.5rem]:[top:auto] max-[47.5rem]:[bottom:0] max-[47.5rem]:[left:0] max-[47.5rem]:[transform:none] max-[47.5rem]:w-full max-[47.5rem]:[max-height:94dvh] max-[47.5rem]:[border-radius:1.25rem_1.25rem_0_0] max-[47.5rem]:[border-bottom:0] max-[47.5rem]:[animation:sheet-in_0.2s_ease-out] max-[47.5rem]:[padding-bottom:env(safe-area-inset-bottom)] focus:[outline:none] ${className}`}
          onCloseAutoFocus={
            onRestoreFocus
              ? (event) => {
                  event.preventDefault();
                  onRestoreFocus();
                }
              : undefined
          }
        >
          <div
            {...swipeHandlers}
            className="modal-heading relative max-[47.5rem]:touch-pan-x flex items-start justify-between gap-2.5 [padding:1.375rem_1.5rem_1.1875rem] [border-bottom:0.0625rem_solid_var(--line)] shrink-0 max-[47.5rem]:[padding:1.3125rem_1.25rem_1.0625rem] [&_h2]:[font-size:1.375rem] [&_h2]:[line-height:1.2] [&_h2]:[letter-spacing:-0.025em] [&_h2]:[overflow-wrap:anywhere] [&_h2]:[font-weight:650] [&_p]:[font-size:0.6875rem] [&_p]:text-muted [&_p]:[line-height:1.6] [&_p]:mt-1.5 max-[47.5rem]:[&_h2]:[font-size:1.3125rem]"
          >
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-2 hidden h-1 w-8 -translate-x-1/2 rounded-full bg-muted/40 max-[47.5rem]:block"
            />
            <div>
              <Dialog.Title>{title}</Dialog.Title>
              <Dialog.Description>{description}</Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="icon-button w-11 h-11 inline-flex items-center justify-center bg-transparent text-muted rounded-full shrink-0 close-button w-11 h-11 [background:var(--chip)] [margin-top:-0.25rem] [margin-right:-0.25rem] max-[47.5rem]:w-11 max-[47.5rem]:h-11 hover:[background:var(--hover)] hover:text-content"
                aria-label={closeLabel}
              >
                <X size="1.25rem" />
              </button>
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
