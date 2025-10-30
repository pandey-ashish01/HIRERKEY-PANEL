"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ChangePasswordPage() {
  const { id } = useParams();
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const updatePassword = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("✅ Password Updated Successfully!");
        setTimeout(() => router.push("/Login"), 1500);
      } else {
        toast.error(data.message || "Failed to update password");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex h-screen w-full items-center justify-center relative overflow-hidden transition-colors duration-700"
      style={{
        backgroundImage: "linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)",
      }}
    >
      <ToastContainer position="top-center" />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 bg-white/70 dark:bg-slate-950/60 
        border border-green-200 dark:border-green-800/40 
        rounded-2xl shadow-2xl p-10 max-w-md w-full text-center 
        backdrop-blur-xl transition-all duration-500"
      >
        <h1
          className="text-3xl font-semibold bg-gradient-to-r 
          from-green-500 via-emerald-500 to-green-600 
          bg-clip-text text-transparent mb-6"
        >
          Set New Password
        </h1>

        <Input
          type="password"
          placeholder="Enter new password"
          className="mb-6"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <Button
          onClick={updatePassword}
          disabled={loading || !newPassword}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 
          hover:from-green-600 hover:to-emerald-600 text-white font-medium 
          py-3 rounded-xl shadow-lg transition-all duration-200"
        >
          {loading ? "Updating..." : "Update Password"}
        </Button>
      </motion.div>
    </div>
  );
}
