"use client";

import { useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";

export default function InputOTPDemo() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error("Enter full 6-letter secret key");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/verify-secret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secretKey: otp }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Secret key verified!");
        setTimeout(() => router.push(`/change-password/${data.userId}`), 1500);
      } else {
        toast.error(data.message || "Invalid key");
      }
    } catch (error) {
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
      <div className="dark:absolute dark:inset-0 dark:bg-gradient-to-br dark:from-blue-950 dark:via-slate-900 dark:to-blue-900"></div>

      {/* glowing bg */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-sky-300/30 dark:bg-blue-700/30 blur-3xl rounded-full"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-400/20 dark:bg-blue-500/20 blur-3xl rounded-full"></div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 bg-white/70 dark:bg-slate-950/60 
        border border-sky-200 dark:border-blue-800/40 
        rounded-2xl shadow-2xl p-10 max-w-md w-full text-center 
        backdrop-blur-xl transition-all duration-500"
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-3xl font-semibold bg-gradient-to-r 
          from-sky-600 via-blue-500 to-blue-700 
          dark:from-blue-300 dark:via-white dark:to-blue-500 
          bg-clip-text text-transparent"
        >
          Enter Secret Key
        </motion.h1>

        <p className="text-sky-800 dark:text-blue-200 text-sm mt-3 mb-8">
          Enter your <span className="font-medium">6-letter secret key</span> to change your password.
        </p>

        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading}
          onClick={handleVerify}
          className="mt-10 w-full bg-gradient-to-r 
          from-sky-500 to-blue-500 
          hover:from-sky-600 hover:to-blue-600 
          text-white font-medium py-3 rounded-xl 
          shadow-lg transition-all duration-200"
        >
          {loading ? "Verifying..." : "Verify & Continue"}
        </motion.button>
      </motion.div>
    </div>
  );
}
