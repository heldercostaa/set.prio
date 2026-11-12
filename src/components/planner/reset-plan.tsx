import { useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Modal } from '../ui/modal';
import { resetPlanner } from '../../store/planner';
import type { Language } from '../../types';
export function ResetPlan({ language }: { language: Language }) {
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const en = language === 'en';
  const title = en ? 'Reset everything?' : 'Redefinir tudo?';
  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center gap-1.5 text-muted"
      >
        <RotateCcw size="0.875rem" />
        {en ? 'Reset plan' : 'Redefinir plano'}
      </button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title={title}
        description={
          en
            ? 'You will lose all priorities, ratings, comments, and preferences saved for this planner in this browser. This cannot be undone.'
            : 'Você perderá todas as prioridades, avaliações, comentários e preferências deste planejador neste navegador. Esta ação não pode ser desfeita.'
        }
        closeLabel={en ? 'Close' : 'Fechar'}
        onRestoreFocus={() => trigger.current?.focus()}
      >
        <div className="flex flex-wrap justify-end gap-3 p-5">
          <button
            type="button"
            className="min-h-11 rounded-lg bg-raised px-4 text-sm"
            onClick={() => setOpen(false)}
          >
            {en ? 'Cancel' : 'Cancelar'}
          </button>
          <button
            type="button"
            className="min-h-11 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white"
            onClick={() => {
              if (resetPlanner()) window.location.reload();
              else setFailed(true);
            }}
          >
            {en ? 'Reset everything' : 'Redefinir tudo'}
          </button>
          {failed && (
            <p role="alert" className="text-sm text-muted">
              {en
                ? 'Browser storage could not be cleared. Your saved plan was left in place.'
                : 'Não foi possível limpar o armazenamento. Seu plano salvo foi mantido.'}
            </p>
          )}
        </div>
      </Modal>
    </>
  );
}
