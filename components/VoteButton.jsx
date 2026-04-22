"use client";

import AnimatedButton from "@/components/ui/AnimatedButton";

export default function VoteButton({ disabled, onClick, loading }) {
  return (
    <AnimatedButton disabled={disabled || loading} onClick={onClick} className="w-full sm:w-auto px-8">
      {loading ? "Submitting..." : "Confirm Vote"}
    </AnimatedButton>
  );
}
