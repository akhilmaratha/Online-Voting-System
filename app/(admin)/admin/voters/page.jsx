"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import PageTransition from "@/components/ui/PageTransition";
import GlassCard from "@/components/ui/GlassCard";
import AnimatedButton from "@/components/ui/AnimatedButton";

const filters = ["all", "pending", "verified"];

export default function AdminVotersPage() {
  const [voters, setVoters] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadVoters = useCallback(async () => {
    setLoading(true);
    const response = await fetch(`/api/admin/voters?status=${filter}`, { cache: "no-store" });
    const data = await response.json();

    if (!response.ok) {
      toast.error(data.message || "Failed to load voters.");
      setLoading(false);
      return;
    }

    setVoters(Array.isArray(data.voters) ? data.voters : []);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    queueMicrotask(() => {
      loadVoters();
    });
  }, [loadVoters]);

  const verifyVoter = async (id) => {
    setActionLoadingId(id);
    const response = await fetch(`/api/admin/voters/${id}/verify`, { method: "PATCH" });
    const data = await response.json();
    setActionLoadingId(null);

    if (!response.ok) {
      toast.error(data.message || "Verification failed.");
      return;
    }

    toast.success("Voter verified.");
    await loadVoters();
  };

  const deleteVoter = async (id) => {
    setActionLoadingId(id);
    const response = await fetch(`/api/admin/voters/${id}`, { method: "DELETE" });
    const data = await response.json();
    setActionLoadingId(null);

    if (!response.ok) {
      toast.error(data.message || "Delete failed.");
      return;
    }

    toast.success("Voter removed.");
    await loadVoters();
  };

  return (
    <PageTransition className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">Voters</h1>
          <p className="mt-1 text-muted">Verify voter identity before allowing vote casting.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <AnimatedButton
              key={item}
              variant={filter === item ? "primary" : "ghost"}
              className="px-3 py-2 capitalize"
              onClick={() => setFilter(item)}
            >
              {item}
            </AnimatedButton>
          ))}
        </div>
      </div>

      <GlassCard className="overflow-x-auto p-0">
        <table className="min-w-full text-sm">
          <thead className="border-b border-(--border) bg-black/5 dark:bg-white/5">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Voter ID</th>
              <th className="px-4 py-3 text-left">Aadhaar</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {voters.map((voter) => (
              <motion.tr
                key={voter._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-b border-(--border)/60"
              >
                <td className="px-4 py-3">{voter.name}</td>
                <td className="px-4 py-3">{voter.email}</td>
                <td className="px-4 py-3">{voter.phone}</td>
                <td className="px-4 py-3">{voter.voterIdMasked || "***"}</td>
                <td className="px-4 py-3">{voter.aadhaarMasked || "XXXX-XXXX-****"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      voter.isVerified ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"
                    }`}
                  >
                    {voter.isVerified ? "Verified" : "Pending"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <AnimatedButton
                      className="px-3 py-1.5 text-xs"
                      disabled={voter.isVerified || actionLoadingId === voter._id}
                      onClick={() => verifyVoter(voter._id)}
                    >
                      Verify
                    </AnimatedButton>
                    <AnimatedButton
                      variant="danger"
                      className="px-3 py-1.5 text-xs"
                      disabled={voter.isVerified || actionLoadingId === voter._id}
                      onClick={() => deleteVoter(voter._id)}
                    >
                      Reject/Delete
                    </AnimatedButton>
                  </div>
                </td>
              </motion.tr>
            ))}
            {!loading && voters.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted">
                  No voters found for this filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </GlassCard>
    </PageTransition>
  );
}
