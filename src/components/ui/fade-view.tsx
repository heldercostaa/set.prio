import { motion, useIsPresent, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

export function FadeView({ children }: { children: ReactNode }) {
  const isPresent = useIsPresent();
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      inert={!isPresent}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.12 }}
    >
      {children}
    </motion.div>
  );
}
