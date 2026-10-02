"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Transition douce à chaque changement de page.
 * Opacité seule : un transform casserait les barres en position fixe des pages.
 */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
