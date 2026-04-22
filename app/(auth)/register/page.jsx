"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";
import PageTransition from "@/components/ui/PageTransition";
import GlassCard from "@/components/ui/GlassCard";
import FloatingInput from "@/components/ui/FloatingInput";
import AnimatedButton from "@/components/ui/AnimatedButton";

const phoneRegex = /^[6-9]\d{9}$/;
const aadhaarRegex = /^\d{12}$/;
const voterIdRegex = /^[A-Z]{3}[0-9]{7}$/;

const digitsOnly = (value) => value.replace(/\D/g, "");

// function formatAadhaarMasked(digits) {
//   const clean = digitsOnly(digits).slice(0, 12);

//   if (!clean) {
//     return "";
//   }

//   if (clean.length <= 4) {
//     return clean;
//   }

//   if (clean.length <= 8) {
//     return `XXXX-${clean.slice(-Math.min(4, clean.length - 4))}`;
//   }

//   return `XXXX-XXXX-${clean.slice(-4)}`;
// }

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    aadhaar: "",
    voterId: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Full name is required.";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    }

    if (!phoneRegex.test(form.phone)) {
      nextErrors.phone = "Enter a valid 10-digit Indian mobile number.";
    }

    if (!aadhaarRegex.test(form.aadhaar)) {
      nextErrors.aadhaar = "Aadhaar must be exactly 12 digits.";
    }

    if (!voterIdRegex.test(form.voterId)) {
      nextErrors.voterId = "Voter ID must match format ABC1234567.";
    }

    if (form.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setLoading(true);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        aadhaar: form.aadhaar,
        voterId: form.voterId,
      }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      toast.error(data.message || "Registration failed.");
      return;
    }

    toast.success("Registration successful. Your account is active now.");
    router.push("/login");
    router.refresh();
  };

  return (
    <PageTransition className="relative min-h-screen auth-grid-bg">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(59,130,246,0.18),transparent_25%),radial-gradient(circle_at_85%_10%,rgba(6,182,212,0.12),transparent_32%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md items-center px-5 py-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full"
        >
          <GlassCard className="p-7 sm:p-8">
            <p className="text-xs uppercase tracking-[0.26em] text-(--accent)">New Voter</p>
            <h1 className="mt-2 text-3xl font-extrabold">Register</h1>
            <p className="mt-2 text-sm text-muted">Create your account to participate in voting.</p>

            <form onSubmit={handleRegister} className="mt-6 space-y-4">
              <FloatingInput label="Full Name" value={form.name} onChange={(e) => onChange("name", e.target.value)} required />
              {errors.name ? <p className="-mt-2 text-xs text-red-400">{errors.name}</p> : null}
              <FloatingInput
                type="email"
                label="Email"
                value={form.email}
                onChange={(e) => onChange("email", e.target.value)}
                required
              />
              {errors.email ? <p className="-mt-2 text-xs text-red-400">{errors.email}</p> : null}
              <FloatingInput
                type="text"
                inputMode="numeric"
                maxLength={10}
                label="Phone Number"
                value={form.phone}
                onChange={(e) => onChange("phone", digitsOnly(e.target.value).slice(0, 10))}
                required
              />
              {errors.phone ? <p className="-mt-2 text-xs text-red-400">{errors.phone}</p> : null}
              <FloatingInput
                type="text"
                inputMode="numeric"
                maxLength={14}
                label="Aadhaar Number"
                // value={formatAadhaarMasked(form.aadhaar)}
                value={form.aadhaar}
                onChange={(e) => onChange("aadhaar", digitsOnly(e.target.value).slice(0, 12))}
                required
              />
              {errors.aadhaar ? <p className="-mt-2 text-xs text-red-400">{errors.aadhaar}</p> : null}
              <FloatingInput
                type="text"
                maxLength={10}
                label="Voter ID Card Number"
                value={form.voterId}
                onChange={(e) => onChange("voterId", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10))}
                required
              />
              {errors.voterId ? <p className="-mt-2 text-xs text-red-400">{errors.voterId}</p> : null}
              <FloatingInput
                type="password"
                label="Password"
                value={form.password}
                onChange={(e) => onChange("password", e.target.value)}
                required
              />
              {errors.password ? <p className="-mt-2 text-xs text-red-400">{errors.password}</p> : null}
              <FloatingInput
                type="password"
                label="Confirm Password"
                value={form.confirmPassword}
                onChange={(e) => onChange("confirmPassword", e.target.value)}
                required
              />
              {errors.confirmPassword ? <p className="-mt-2 text-xs text-red-400">{errors.confirmPassword}</p> : null}

              <div>
                <label className="mb-1.5 block text-sm text-muted">Role</label>
                <select
                  value="voter"
                  disabled
                  className="h-11 w-full rounded-xl border border-(--border) bg-transparent px-3 text-sm"
                >
                  <option value="voter">Voter</option>
                </select>
              </div>

              <AnimatedButton type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
              </AnimatedButton>
            </form>

            <p className="mt-4 text-sm text-muted">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-(--accent) hover:underline">
                Login
              </Link>
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </PageTransition>
  );
}
