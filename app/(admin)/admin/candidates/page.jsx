"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import PageTransition from "@/components/ui/PageTransition";
import FloatingInput from "@/components/ui/FloatingInput";
import AnimatedButton from "@/components/ui/AnimatedButton";
import GlassCard from "@/components/ui/GlassCard";
import AdminTable from "@/components/AdminTable";

const initialForm = {
  name: "",
  party: "",
  bio: "",
  image: "",
  color: "#3b82f6",
};

export default function AdminCandidatesPage() {
  const [items, setItems] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const loadCandidates = useCallback(async () => {
    const response = await fetch("/api/candidates", { cache: "no-store" });
    const data = await response.json();
    const candidates = Array.isArray(data.candidates)
      ? data.candidates.filter((candidate) => candidate && candidate._id)
      : [];
    setItems(candidates);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      loadCandidates();
    });
  }, [loadCandidates]);

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const openAdd = () => {
    setEditingId(null);
    setForm(initialForm);
    setDrawerOpen(true);
  };

  const openEdit = (candidate) => {
    if (!candidate?._id) {
      toast.error("Invalid candidate record.");
      return;
    }

    setEditingId(candidate._id);
    setForm({
      name: candidate.name || "",
      party: candidate.party || "",
      bio: candidate.bio || "",
      image: candidate.image || "",
      color: candidate.color || "#3b82f6",
    });
    setDrawerOpen(true);
  };

  const saveCandidate = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const method = editingId ? "PUT" : "POST";
    const endpoint = editingId ? `/api/candidates/${editingId}` : "/api/candidates";

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      toast.error(data.message || "Failed to save candidate.");
      return;
    }

    toast.success(editingId ? "Candidate updated." : "Candidate added.");
    setDrawerOpen(false);
    setForm(initialForm);
    setEditingId(null);
    await loadCandidates();
  };

  const deleteCandidate = async () => {
    if (!deleteTarget?._id) {
      toast.error("No candidate selected for deletion.");
      setDeleteTarget(null);
      return;
    }

    const response = await fetch(`/api/candidates/${deleteTarget._id}`, { method: "DELETE" });
    const data = await response.json();

    if (!response.ok) {
      toast.error(data.message || "Delete failed.");
      return;
    }

    toast.success("Candidate deleted.");
    setDeleteTarget(null);
    await loadCandidates();
  };

  return (
    <PageTransition className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-7 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">Candidates</h1>
          <p className="mt-1 text-muted">Add, edit, and remove candidates.</p>
        </div>
        <AnimatedButton onClick={openAdd} className="gap-2">
          <Plus size={16} />
          Add Candidate
        </AnimatedButton>
      </div>

      <AdminTable rows={items} onEdit={openEdit} onDelete={setDeleteTarget} />

      <AnimatePresence>
        {drawerOpen ? (
          <motion.div
            className="fixed inset-0 z-40 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 22, stiffness: 210 }}
              className="absolute right-0 top-0 h-full w-full max-w-md p-4"
            >
              <GlassCard className="h-full overflow-auto p-6">
                <h2 className="text-2xl font-bold">{editingId ? "Edit Candidate" : "Add Candidate"}</h2>
                <form onSubmit={saveCandidate} className="mt-5 space-y-4">
                  <FloatingInput label="Name" value={form.name} onChange={(e) => onChange("name", e.target.value)} required />
                  <FloatingInput label="Party" value={form.party} onChange={(e) => onChange("party", e.target.value)} required />
                  <FloatingInput label="Bio" value={form.bio} onChange={(e) => onChange("bio", e.target.value)} />
                  <FloatingInput label="Image URL" value={form.image} onChange={(e) => onChange("image", e.target.value)} />
                  <FloatingInput label="Color" value={form.color} onChange={(e) => onChange("color", e.target.value)} />
                  <div className="flex justify-end gap-2 pt-2">
                    <AnimatedButton variant="ghost" type="button" onClick={() => setDrawerOpen(false)}>
                      Cancel
                    </AnimatedButton>
                    <AnimatedButton type="submit" disabled={submitting}>
                      {submitting ? "Saving..." : "Save"}
                    </AnimatedButton>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget ? (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="w-full max-w-md">
              <GlassCard>
                <h3 className="text-xl font-bold">Delete Candidate</h3>
                <p className="mt-2 text-muted">Are you sure you want to delete {deleteTarget.name}?</p>
                <div className="mt-5 flex justify-end gap-2">
                  <AnimatedButton variant="ghost" onClick={() => setDeleteTarget(null)}>
                    Cancel
                  </AnimatedButton>
                  <AnimatedButton variant="danger" onClick={deleteCandidate}>
                    Delete
                  </AnimatedButton>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </PageTransition>
  );
}
