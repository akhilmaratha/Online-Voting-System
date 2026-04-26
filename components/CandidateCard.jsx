"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

export default function CandidateCard({ candidate, selected = false, onSelect }) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.18 }}>
      <button type="button" onClick={() => onSelect?.(candidate)} className="w-full text-left">
        <GlassCard
          className={cn(
            "h-full transition-all duration-300",
            selected
              ? "text-(--accent) shadow-[0_0_20px_color-mix(in_srgb,var(--accent-glow)_30%,transparent)]"
              : "hover:border-[color-mix(in_srgb,var(--accent)_50%,var(--border))]",
          )}
        >
          <div className="mb-4 overflow-hidden rounded-xl">
            <Image
              src={candidate.image || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80&auto=format&fit=crop"}
              alt={candidate.name}
              width={600}
              height={360}
              className="h-44 w-full object-cover"
            />
          </div>
          <h3 className="text-xl font-heading font-bold">{candidate.name}</h3>
          <p className="mt-1 text-sm font-semibold text-(--accent)">{candidate.party}</p>
          <p className="mt-3 line-clamp-3 text-sm text-muted">{candidate.bio || "No candidate bio available."}</p>
        </GlassCard>
      </button>
    </motion.div>
  );
}
