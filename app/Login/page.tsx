"use client";
import Link from "next/link";
import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Phone, Lock, AlertCircle } from "lucide-react";

export default function LoginForm() {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [isSwapped, setIsSwapped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

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

  // ✉️ Handle Mobile Change
  const handleMobileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    setMobile(value);
    setIsSwapped(value.length > 0);
  };

  // 🚀 Login Function - EXACT DOCUMENT 5 LOGIC
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, password }),
      });

      const data = await res.json();

      if (data.success) {
        // Save token and user data
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        
        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        setError(data.message || "Login failed!");
      }
    } catch (err) {
      setError("Network error! Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
          <h1
            className="text-4xl font-light tracking-wide bg-gradient-to-r from-blue-300 via-white to-blue-500 bg-clip-text text-transparent"
            style={{
              opacity: 1,
              transform: "translateY(0px)",
              transition: "opacity 1s, transform 1s"
            }}
          >
            {currentText}
            <span className="animate-pulse">|</span>
          </h1>

          <h2
            className="text-3xl font-light tracking-wide text-blue-100"
            style={{
              opacity: 1,
              transform: "translateY(0px)",
              transition: "opacity 1s 0.5s, transform 1s 0.5s"
            }}
          >
            Explore levels of understanding
          </h2>

          <p
            className="text-blue-200 text-sm mt-6"
            style={{
              opacity: 1,
              transition: "opacity 1s 1s"
            }}
          >
            View reporting structures and departments across the{" "}
            <span className="text-white font-medium">organization</span>.
          </p>
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
              Enter your mobile and password
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Mobile Input */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="tel"
                  value={mobile}
                  onChange={handleMobileChange}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                  className="w-full bg-slate-900/50 border border-blue-900/50 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your 10-digit mobile"
                  required
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
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                  className="w-full bg-slate-900/50 border border-blue-900/50 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  required
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
              className="w-full bg-slate-950 hover:bg-slate-900 text-white font-medium py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Logging in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}