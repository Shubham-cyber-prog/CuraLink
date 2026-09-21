"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export function InitialSiteLoader() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Show splash on initial site load, dismiss gracefully after content is ready
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 750);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="initial-site-loader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.02,
            filter: "blur(8px)",
            transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
          }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-[#070B14] transition-colors duration-200 select-none pointer-events-auto"
          aria-live="polite"
          aria-busy={isVisible}
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] bg-gradient-to-tr from-teal-500/15 via-teal-400/10 to-emerald-500/15 rounded-full blur-3xl dark:from-teal-500/20 dark:via-teal-400/15 dark:to-emerald-500/20" />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            {/* Logo with pulsating aura */}
            <div className="relative mb-6">
              <motion.div
                animate={{
                  scale: [1, 1.14, 1],
                  opacity: [0.35, 0.75, 0.35],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 -m-3 rounded-full bg-teal-400/20 dark:bg-teal-500/25 blur-xl"
              />

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center"
              >
                <Image
                  src="/logo.png"
                  alt="CuraLink"
                  width={96}
                  height={96}
                  className="w-full h-full object-contain drop-shadow-md"
                  priority
                />
              </motion.div>
            </div>

            {/* Brand Wordmark */}
            <motion.div
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="text-center"
            >
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Cura<span className="text-teal-600 dark:text-teal-400">Link</span>
              </h1>
              <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 tracking-wide">
                AI-Powered Telehealth Platform
              </p>
            </motion.div>

            {/* Modern Animated Progress Line */}
            <div className="mt-7 w-36 sm:w-44 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  duration: 1.1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-1/2 h-full bg-gradient-to-r from-transparent via-teal-500 to-transparent rounded-full"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
