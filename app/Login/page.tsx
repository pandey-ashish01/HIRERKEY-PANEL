"use client";
import Link from "next/link";
import { useState, useEffect, ChangeEvent } from "react";
import { Mail, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSwapped, setIsSwapped] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🧠 Typewriter effect
  const texts = ["Intelligent Hierarchy", "From Vision to Execution"];
  const [currentText, setCurrentText] = useState("");
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (index === texts.length) return;

    const timeout = setTimeout(() => {
      const fullText = texts[index];
      setCurrentText(
        deleting
          ? fullText.substring(0, subIndex - 1)
          : fullText.substring(0, subIndex + 1)
      );

      if (!deleting && subIndex === fullText.length) {
        setTimeout(() => setDeleting(true), 1500);
      } else if (deleting && subIndex === 0) {
        setDeleting(false);
        setIndex((prev) => (prev + 1) % texts.length);
      } else {
        setSubIndex((prev) => prev + (deleting ? -1 : 1));
      }
    }, deleting ? 60 : 120);

    return () => clearTimeout(timeout);
  }, [subIndex, deleting, index]);

  // ✉️ Handle Email Change
  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    setEmail(value);
    setIsSwapped(value.length > 0);
  };

  // 🚀 Login Function
  const handleSubmit = async () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      // ✅ Save user in localStorage
      localStorage.setItem("user", JSON.stringify(data.data));

      alert("Login successful!");
      window.location.href = "/dashboard"; // redirect after login
    } catch (err: any) {
      alert(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Auto redirect if already logged in
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) window.location.href = "/dashboard";
  }, []);

  return (
    <div className="h-screen w-screen flex overflow-hidden relative">
      {/* Left Side */}
      <div
        className={`hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-900 via-blue-950 to-slate-900 transition-all duration-700 ease-in-out ${
          isSwapped ? "lg:translate-x-full" : "lg:translate-x-0"
        }`}
        style={{ zIndex: isSwapped ? 10 : 1 }}
      >
        <div className="absolute inset-0">
          <img
            src="/images/login.png"
            alt="Background"
            className="w-full h-full object-cover opacity-60"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 to-transparent blur-2xl"></div>

        <div className="absolute w-full bottom-10 flex flex-col items-center text-white z-10">
          <motion.h1
            className="text-4xl font-light tracking-wide bg-gradient-to-r from-blue-300 via-white to-blue-500 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            {currentText}
            <span className="animate-pulse">|</span>
          </motion.h1>

          <motion.h2
            className="text-3xl font-light tracking-wide text-blue-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            Explore levels of understanding
          </motion.h2>

          <motion.p
            className="text-blue-200 text-sm mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
          >
            View reporting structures and departments across the{" "}
            <span className="text-white font-medium">organization</span>.
          </motion.p>
        </div>
      </div>

      {/* Right Side - Login */}
      <div
        className={`w-full lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900 flex flex-col justify-center overflow-y-auto transition-all duration-700 ease-in-out ${
          isSwapped ? "lg:-translate-x-full" : "lg:translate-x-0"
        }`}
        style={{ zIndex: isSwapped ? 1 : 10 }}
      >
        <div className="max-w-md mx-auto w-full px-8 py-12">
          <div className="mb-10">
            <p className="text-blue-300 text-sm mb-2">Login to your account</p>
            <h1 className="text-5xl font-bold text-white mb-2">Welcome Back!</h1>
            <p className="text-gray-400 text-sm">
              Enter your email and password
            </p>
          </div>

          <div className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  className="w-full bg-slate-900/50 border border-blue-900/50 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="user@gmail.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-blue-900/50 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link href="/Secretkey">
                <button className="text-sm text-blue-400 hover:text-blue-300 underline transition-colors bg-transparent border-none cursor-pointer">
                  Forgot Password?
                </button>
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-slate-950 hover:bg-slate-900 text-white font-medium py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer border-none disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
