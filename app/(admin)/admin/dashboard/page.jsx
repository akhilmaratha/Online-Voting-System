"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import PageTransition from "@/components/ui/PageTransition";
import GlassCard from "@/components/ui/GlassCard";
import AnimatedButton from "@/components/ui/AnimatedButton";

function CountUp({ value, decimals = 0 }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame;
    const duration = 800;
    const start = performance.now();

    const step = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      setDisplay(value * progress);
      if (progress < 1) {
        frame = requestAnimationFrame(step);
      }
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <span>{display.toFixed(decimals)}</span>;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalVoters: 0,
    votesCast: 0,
    turnout: 0,
    leadingCandidate: null,
  });

  useEffect(() => {
    const load = async () => {
      const response = await fetch("/api/admin/stats", { cache: "no-store" });
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      setStats(data);
    };

    load();
  }, []);

  const cards = [
    { title: "Total Voters", value: stats.totalVoters, decimals: 0 },
    { title: "Votes Cast", value: stats.votesCast, decimals: 0 },
    { title: "Turnout %", value: stats.turnout, decimals: 1 },
  ];

  return (
    <PageTransition className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">Admin Dashboard</h1>
          <p className="mt-1 text-muted">Monitor election health in real time.</p>
        </div>
        <AnimatedButton variant="ghost" onClick={() => signOut({ callbackUrl: "/login" })}>
          Logout
        </AnimatedButton>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
        }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {cards.map((card) => (
          <motion.div key={card.title} variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}>
            <GlassCard>
              <p className="text-sm text-muted">{card.title}</p>
              <p className="mt-2 text-4xl font-heading font-bold">
                <CountUp value={card.value} decimals={card.decimals} />
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      <GlassCard className="mt-6">
        <p className="text-sm text-muted">Leading Candidate</p>
        <p className="mt-2 text-2xl font-bold">
          {stats.leadingCandidate
            ? `${stats.leadingCandidate.name} (${stats.leadingCandidate.party})`
            : "No votes yet"}
        </p>
      </GlassCard>

      <div className="mt-7 flex flex-wrap gap-3">
        <Link href="/admin/candidates">
          <AnimatedButton>Manage Candidates</AnimatedButton>
        </Link>
        <Link href="/admin/results">
          <AnimatedButton variant="ghost">View Results</AnimatedButton>
        </Link>
      </div>
    </PageTransition>
  );
}
