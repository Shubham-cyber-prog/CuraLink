"use client";

import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/components/motion/variants";

interface Review {
  id: string;
  nameInitial: string;
  rating: number;
  comment: string;
  date: string;
}

export function ReviewCard({ review }: { review: Review }) {
  return (
    <motion.div variants={fadeInUp} className="flex gap-4 border-b border-slate-100 py-4 last:border-0">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 font-semibold text-teal-700">
        {review.nameInitial}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${i < review.rating ? "fill-current" : "fill-slate-200 text-slate-200"}`}
              />
            ))}
          </div>
          <span className="text-xs text-slate-400">{review.date}</span>
        </div>
        <p className="text-sm text-slate-600">{review.comment}</p>
      </div>
    </motion.div>
  );
}
