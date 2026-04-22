"use client";

import AnimatedButton from "@/components/ui/AnimatedButton";
import GlassCard from "@/components/ui/GlassCard";

export default function AdminTable({ rows = [], onEdit, onDelete }) {
  const safeRows = Array.isArray(rows) ? rows.filter((candidate) => candidate && candidate._id) : [];

  return (
    <GlassCard className="overflow-x-auto p-0">
      <table className="min-w-full text-sm">
        <thead className="border-b border-(--border) bg-black/5 dark:bg-white/5">
          <tr>
            <th className="px-4 py-3 text-left">Name</th>
            <th className="px-4 py-3 text-left">Party</th>
            <th className="px-4 py-3 text-left">Votes</th>
            <th className="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {safeRows.map((candidate) => (
            <tr key={candidate._id} className="border-b border-(--border)/60">
              <td className="px-4 py-3">{candidate.name}</td>
              <td className="px-4 py-3 text-muted">{candidate.party}</td>
              <td className="px-4 py-3">{candidate.voteCount}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <AnimatedButton variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => onEdit(candidate)}>
                    Edit
                  </AnimatedButton>
                  <AnimatedButton variant="danger" className="px-3 py-1.5 text-xs" onClick={() => onDelete(candidate)}>
                    Delete
                  </AnimatedButton>
                </div>
              </td>
            </tr>
          ))}
          {safeRows.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-muted">
                No candidates yet.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </GlassCard>
  );
}
