"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-gradient-to-r from-[var(--accent)] to-[var(--accent-glow)] text-white border border-white/20 hover:shadow-[0_0_24px_color-mix(in_srgb,var(--accent-glow)_45%,transparent)]",
  danger:
    "bg-gradient-to-r from-red-500 to-rose-500 text-white border border-red-200/30 hover:shadow-[0_0_24px_rgba(239,68,68,0.45)]",
  ghost:
    "bg-transparent text-[var(--text-primary)] border border-[var(--border)] hover:bg-black/5 dark:hover:bg-white/5",
};

export default function AnimatedButton({
  children,
  className = "",
  variant = "primary",
  disabled = false,
  ...props
}) {
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ duration: 0.16 }}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2.5 font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
