"use client";

import { motion } from "framer-motion";

export default function ResultProgressBar({ candidate, totalVotes }) {
  const percentage = totalVotes > 0 ? (candidate.voteCount / totalVotes) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <p className="font-medium">{candidate.name}</p>
        <p className="text-muted">
          {candidate.voteCount} votes ({percentage.toFixed(1)}%)
        </p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ background: candidate.color || "var(--accent)" }}
        />
      </div>
    </div>
  );
}
