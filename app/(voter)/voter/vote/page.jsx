"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PageTransition from "@/components/ui/PageTransition";
import CandidateCard from "@/components/CandidateCard";
import VoteButton from "@/components/VoteButton";
import GlassCard from "@/components/ui/GlassCard";
import AnimatedButton from "@/components/ui/AnimatedButton";

export default function VotePage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      const response = await fetch("/api/candidates", { cache: "no-store" });
      const data = await response.json();
      setCandidates(data.candidates || []);
    };

    load();
  }, []);

  const submitVote = async () => {
    if (!selected) {
      return;
    }

    setLoading(true);

    const response = await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateId: selected._id }),
    });

    const data = await response.json();
    setLoading(false);
    setConfirmOpen(false);

    if (!response.ok) {
      toast.error(data.message || "Vote failed.");
      return;
    }

    setShowSuccess(true);
    toast.success("Vote cast successfully.");
    await update();

    setTimeout(() => {
      router.push("/voter/dashboard");
      router.refresh();
    }, 1400);
  };

  return (
    <PageTransition className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">Cast Your Vote</h1>
          <p className="mt-1 text-muted">Select one candidate. This action cannot be undone.</p>
        </div>
        <AnimatedButton variant="ghost" onClick={() => router.push("/voter/dashboard")}>Back</AnimatedButton>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
        }}
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {candidates.map((candidate) => (
          <motion.div key={candidate._id} variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}>
            <CandidateCard
              candidate={candidate}
              selected={selected?._id === candidate._id}
              onSelect={setSelected}
            />
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-8 flex items-center justify-end">
        <VoteButton
          disabled={!selected || session?.user?.hasVoted}
          loading={loading}
          onClick={() => setConfirmOpen(true)}
        />
      </div>

      <AnimatePresence>
        {confirmOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 grid place-items-center bg-black/60 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md"
            >
              <GlassCard>
                <h3 className="text-xl font-heading">Confirm Vote</h3>
                <p className="mt-2 text-muted">
                  Are you sure you want to vote for <span className="font-semibold text-[var(--accent)]">{selected?.name}</span>?
                </p>
                <div className="mt-5 flex justify-end gap-2">
                  <AnimatedButton variant="ghost" onClick={() => setConfirmOpen(false)}>
                    Cancel
                  </AnimatedButton>
                  <AnimatedButton onClick={submitVote} disabled={loading}>
                    Confirm
                  </AnimatedButton>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccess ? (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <CheckCircle2 className="mx-auto mb-2 text-emerald-400" size={64} />
              <p className="text-xl font-semibold text-white">Vote Recorded</p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </PageTransition>
  );
}
