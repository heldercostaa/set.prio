import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
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
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay fixed [inset:0] [background:#0007]  [z-index:90] [animation:overlay-in_0.18s_ease-out]" />
        <Dialog.Content
          className={`modal fixed [top:50%] [left:50%] [transform:translate(-50%,_-50%)] [z-index:91] [width:min(37.5rem,_calc(100vw_-_40px))] [max-height:min(90dvh,_940px)] border border-separator rounded-5 bg-surface [box-shadow:0_28px_100px_#0005] flex flex-col overflow-hidden text-content [animation:modal-in_0.18s_ease-out] max-[47.5rem]:[top:auto] max-[47.5rem]:[bottom:0] max-[47.5rem]:[left:0] max-[47.5rem]:[transform:none] max-[47.5rem]:w-full max-[47.5rem]:[max-height:94dvh] max-[47.5rem]:[border-radius:1.25rem_20px_0_0] max-[47.5rem]:[border-bottom:0] max-[47.5rem]:[animation:sheet-in_0.2s_ease-out] max-[47.5rem]:[padding-bottom:env(safe-area-inset-bottom)] ${className}`}
          onCloseAutoFocus={
            onRestoreFocus
              ? (event) => {
                  event.preventDefault();
                  onRestoreFocus();
                }
              : undefined
          }
        >
          <div className="modal-heading flex items-start justify-between gap-2.5 [padding:1.375rem_24px_19px] [border-bottom:0.0625rem_solid_var(--line)] shrink-0 max-[47.5rem]:[padding:1.3125rem_20px_17px]">
            <div>
              <Dialog.Title>{title}</Dialog.Title>
              <Dialog.Description>{description}</Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="icon-button w-11 h-11 inline-flex items-center justify-center bg-transparent text-muted rounded-full shrink-0 close-button w-11 h-11 [background:var(--chip)] [margin-top:-0.25rem] [margin-right:-0.25rem] max-[47.5rem]:w-11 max-[47.5rem]:h-11"
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
