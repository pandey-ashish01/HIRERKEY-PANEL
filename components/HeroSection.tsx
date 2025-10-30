"use client";
import Link from "next/link";
import { Spotlight } from "./ui/spotlight";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <div className="relative flex h-screen w-full overflow-hidden rounded-md bg-neutral-950 antialiased md:items-center md:justify-center">
      {/* Background Spotlight */}
      <Spotlight
        className="top-10 left-0  md:-top-20 md:left-60 opacity-60"
        fill="white"
      />

      {/* Main Content */}
      <div className="relative z-10 mx-auto w-full p-4 md:pt-0 flex flex-col items-center justify-center text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-6xl font-extrabold text-transparent sm:text-7xl md:text-8xl"
        >
          Join With Us
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-4 text-2xl font-semibold text-neutral-400 sm:text-3xl"
        >
          Become a Member at <span className="text-white">Hirerkey</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-base text-neutral-400 sm:text-lg"
        >
          Access advanced tools, manage your hiring operations, and collaborate with your team effortlessly.  
          Empower your workspace with <span className="text-white font-medium">Hirerkey Admin</span> — the hub for smarter management.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-10 flex flex-wrap justify-center gap-6"
        >
        <Link href="/Login">
          <button className="rounded-md bg-white px-8 py-3 text-base font-semibold text-black transition-all duration-300 hover:scale-105 hover:bg-neutral-200">
            Go to Dashboard
          </button></Link>
     
        </motion.div>
      </div>
    </div>
  );
}
