"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

export default function FloatingInput({
  label,
  className = "",
  value,
  onChange,
  type = "text",
  required = false,
  ...props
}) {
  const id = useId();

  return (
    <div className={cn("relative", className)}>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder=" "
        className="peer h-12 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 pt-4 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_30%,transparent)]"
        {...props}
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-3 top-3.5 origin-left text-sm text-[var(--text-secondary)] transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-[var(--accent)] peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-xs"
      >
        {label}
      </label>
    </div>
  );
}
