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
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content
          className={`modal ${className}`}
          onCloseAutoFocus={
            onRestoreFocus
              ? (event) => {
                  event.preventDefault();
                  onRestoreFocus();
                }
              : undefined
          }
        >
          <div className="modal-heading">
            <div>
              <Dialog.Title>{title}</Dialog.Title>
              <Dialog.Description>{description}</Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button type="button" className="icon-button close-button" aria-label={closeLabel}>
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
