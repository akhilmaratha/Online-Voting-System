"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import PageTransition from "@/components/ui/PageTransition";
import GlassCard from "@/components/ui/GlassCard";
import AnimatedButton from "@/components/ui/AnimatedButton";

function CountUp({ value }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame;
    const duration = 700;
    const start = performance.now();

    const step = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      setDisplay(Math.round(value * progress));
      if (progress < 1) {
        frame = requestAnimationFrame(step);
      }
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <span>{display}</span>;
}

export default function VoterDashboardPage() {
  const { data: session } = useSession();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const response = await fetch("/api/candidates", { cache: "no-store" });
      const data = await response.json();
      setCandidates(data.candidates || []);
      setLoading(false);
    };

    load();
  }, []);

  const totalVotes = useMemo(
    () => candidates.reduce((sum, candidate) => sum + candidate.voteCount, 0),
    [candidates],
  );

  const hasVoted = session?.user?.hasVoted;

  return (
    <PageTransition className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">Welcome, {session?.user?.name || "Voter"}</h1>
          <p className="mt-1 text-muted">Your vote is encrypted and stored securely.</p>
        </div>
        <AnimatedButton variant="ghost" onClick={() => signOut({ callbackUrl: "/login" })}>
          Logout
        </AnimatedButton>
      </div>

      <div className="mb-7">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            hasVoted
              ? "bg-emerald-500/15 text-emerald-400"
              : "bg-amber-500/15 text-amber-400"
          }`}
        >
          {hasVoted ? "You have voted" : "You have not voted yet"}
        </span>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
        }}
        className="grid gap-4 sm:grid-cols-2"
      >
        {[{ label: "Total Candidates", value: candidates.length }, { label: "Total Votes Cast", value: totalVotes }].map((item) => (
          <motion.div key={item.label} variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}>
            <GlassCard>
              <p className="text-sm text-muted">{item.label}</p>
              <p className="mt-2 text-4xl font-heading font-bold">
                {loading ? "..." : <CountUp value={item.value} />}
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-8">
        <Link href="/voter/vote">
          <AnimatedButton disabled={hasVoted} className="w-full sm:w-auto px-8 py-3">
            {hasVoted ? "Vote Already Cast" : "Go To Vote"}
          </AnimatedButton>
        </Link>
      </div>
    </PageTransition>
  );
}
