"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";
import PageTransition from "@/components/ui/PageTransition";
import GlassCard from "@/components/ui/GlassCard";
import FloatingInput from "@/components/ui/FloatingInput";
import AnimatedButton from "@/components/ui/AnimatedButton";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      toast.error("Invalid email or password.");
      return;
    }

    toast.success("Welcome back.");
    router.push("/voter/dashboard");
    router.refresh();
  };

  return (
    <PageTransition className="relative min-h-screen auth-grid-bg">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.18),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(6,182,212,0.12),transparent_35%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md items-center px-5 py-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full"
        >
          <GlassCard className="p-7 sm:p-8">
            <p className="text-xs uppercase tracking-[0.26em] text-(--accent)">Secure Access</p>
            <h1 className="mt-2 text-3xl font-extrabold">Login</h1>
            <p className="mt-2 text-sm text-muted">Sign in to cast or manage votes securely.</p>

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <FloatingInput
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <FloatingInput
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <AnimatedButton type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing In..." : "Login"}
              </AnimatedButton>
            </form>

            <p className="mt-4 text-sm text-muted">
              New here?{" "}
              <Link href="/register" className="font-semibold text-(--accent) hover:underline">
                Create an account
              </Link>
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </PageTransition>
  );
}
