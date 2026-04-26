import Link from "next/link";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Candidate from "@/models/Candidate";
import Vote from "@/models/Vote";
import PageTransition from "@/components/ui/PageTransition";
import GlassCard from "@/components/ui/GlassCard";
import AnimatedButton from "@/components/ui/AnimatedButton";
import ResultChart from "@/components/ResultChart";
import ResultProgressBar from "@/components/ResultProgressBar";

async function getResults() {
  await connectDB();

  const candidates = await Candidate.find({}).sort({ voteCount: -1 }).lean();
  const totalVotes = await Vote.countDocuments();
  const safeCandidates = candidates.map((candidate) => ({
    id: candidate._id?.toString?.() ?? String(candidate._id),
    name: candidate.name,
    party: candidate.party,
    bio: candidate.bio || "",
    image: candidate.image || "",
    voteCount: Number(candidate.voteCount || 0),
    color: candidate.color || "",
    createdAt: candidate.createdAt ? candidate.createdAt.toISOString() : null,
  }));

  return {
    candidates: safeCandidates,
    totalVotes: Number(totalVotes || 0),
    winner: safeCandidates[0]
      ? {
          id: safeCandidates[0].id,
          name: safeCandidates[0].name,
          party: safeCandidates[0].party,
          votes: safeCandidates[0].voteCount,
        }
      : null,
  };
}

export default async function HomePage() {
  const session = await auth();
  const result = await getResults();
  const chartData = result.candidates || [];

  return (
    <PageTransition className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(16,185,129,0.14),rgba(59,130,246,0.14),rgba(2,6,23,0.85))] p-6 shadow-2xl shadow-black/20 backdrop-blur">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-(--accent)">Public Election Portal</p>
          <h1 className="mt-2 text-4xl font-extrabold sm:text-5xl">Live voter results, open to every guest</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted sm:text-base">
            View the current election results without logging in. Sign in to vote, or create an account if you do not have one yet.
          </p>
        </div>

        {!session ? (
          <div className="flex flex-wrap gap-3">
            <Link href="/login">
              <AnimatedButton>Login</AnimatedButton>
            </Link>
            <Link href="/register">
              <AnimatedButton variant="ghost">Signup</AnimatedButton>
            </Link>
          </div>
        ) : null}
      </div>

      <GlassCard className="mb-6 border-[color-mix(in_srgb,var(--accent)_35%,var(--border))]">
        <p className="text-sm uppercase tracking-[0.2em] text-(--accent)">Winner</p>
        <h2 className="mt-2 text-3xl font-extrabold text-foreground">
          {result.winner ? `${result.winner.name} (${result.winner.party})` : "No winner yet"}
        </h2>
        <p className="mt-1 text-muted">Total Votes: {result.totalVotes || 0}</p>
      </GlassCard>

      <ResultChart data={chartData} />

      <GlassCard className="mt-6 space-y-4">
        <h3 className="text-xl font-heading">Progress Overview</h3>
        {(result.candidates || []).map((candidate) => (
          <ResultProgressBar key={candidate.id} candidate={candidate} totalVotes={result.totalVotes || 0} />
        ))}
      </GlassCard>
    </PageTransition>
  );
}
