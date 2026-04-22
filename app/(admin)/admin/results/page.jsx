"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import PageTransition from "@/components/ui/PageTransition";
import GlassCard from "@/components/ui/GlassCard";
import AnimatedButton from "@/components/ui/AnimatedButton";
import ResultChart from "@/components/ResultChart";
import ResultProgressBar from "@/components/ResultProgressBar";
import { toCSV } from "@/lib/utils";

export default function AdminResultsPage() {
  const [result, setResult] = useState({ candidates: [], totalVotes: 0, winner: null });

  const load = useCallback(async () => {
    const response = await fetch("/api/results", { cache: "no-store" });

    if (!response.ok) {
      const payload = await response.json();
      toast.error(payload.message || "Failed to load results.");
      return;
    }

    const data = await response.json();
    setResult(data);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      load();
    });

    const id = setInterval(() => {
      load();
    }, 10000);

    return () => clearInterval(id);
  }, [load]);

  const chartData = useMemo(() => result.candidates || [], [result.candidates]);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "voting-results.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCsv = () => {
    const rows = (result.candidates || []).map((candidate) => ({
      name: candidate.name,
      party: candidate.party,
      votes: candidate.voteCount,
      color: candidate.color,
    }));

    const csv = toCSV(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "voting-results.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageTransition className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">Election Results</h1>
          <p className="mt-1 text-muted">Auto-refreshing every 10 seconds.</p>
        </div>
        <div className="flex gap-2">
          <AnimatedButton variant="ghost" onClick={exportJson}>
            Export JSON
          </AnimatedButton>
          <AnimatedButton onClick={exportCsv}>Export CSV</AnimatedButton>
        </div>
      </div>

      <GlassCard className="mb-6 border-(--accent)/40">
        <p className="text-sm uppercase tracking-[0.2em] text-(--accent)">Winner</p>
        <h2 className="mt-2 text-3xl font-extrabold text-foreground">
          {result.winner ? `${result.winner.name} (${result.winner.party})` : "No winner yet"}
        </h2>
        <p className="mt-1 text-muted">Total Votes: {result.totalVotes}</p>
      </GlassCard>

      <ResultChart data={chartData} />

      <GlassCard className="mt-6 space-y-4">
        <h3 className="text-xl font-heading">Progress Overview</h3>
        {(result.candidates || []).map((candidate) => (
          <ResultProgressBar key={candidate._id} candidate={candidate} totalVotes={result.totalVotes} />
        ))}
      </GlassCard>
    </PageTransition>
  );
}
