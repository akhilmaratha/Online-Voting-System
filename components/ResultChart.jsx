"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import GlassCard from "@/components/ui/GlassCard";

export default function ResultChart({ data = [] }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <GlassCard className="h-80">
        <h3 className="mb-4 text-lg font-heading">Vote Count by Candidate</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
            <YAxis stroke="var(--text-secondary)" allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                color: "var(--text-primary)",
              }}
            />
            <Bar dataKey="voteCount" radius={[8, 8, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry._id} fill={entry.color || "#3b82f6"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>

      <GlassCard className="h-80">
        <h3 className="mb-4 text-lg font-heading">Vote Distribution</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="voteCount" nameKey="name" outerRadius={96} innerRadius={54}>
              {data.map((entry) => (
                <Cell key={entry._id} fill={entry.color || "#3b82f6"} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                color: "var(--text-primary)",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </GlassCard>
    </div>
  );
}
