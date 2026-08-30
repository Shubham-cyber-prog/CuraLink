"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, ClipboardList, Clock, Stethoscope, UserRound, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cardReveal, staggerContainer } from "@/components/motion/variants";

type Appointment = { id: string; patientName: string; time: string; type: "Video" | "In-Person"; status: string };
type DashboardData = { appointments: Appointment[]; stats: { todayCount: number; patientCount: number; weekCount: number } };

const emptyData: DashboardData = { appointments: [], stats: { todayCount: 0, patientCount: 0, weekCount: 0 } };

export default function DoctorDashboardPage() {
  const [name, setName] = useState("Doctor");
  const [data, setData] = useState<DashboardData>(emptyData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetch("/api/auth/me"), fetch("/api/doctor/appointments/today")]).then(async ([me, appointments]) => {
      if (me.ok) {
        const body = await me.json() as { user: { name: string } };
        setName(body.user.name.replace(/^Dr\.\s*/, ""));
      }
      if (appointments.ok) setData(await appointments.json() as DashboardData);
    }).catch(() => undefined).finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Today's appointments", value: data.stats.todayCount, icon: CalendarDays, color: "bg-cyan-100 text-cyan-700" },
    { label: "Total patients", value: data.stats.patientCount, icon: UserRound, color: "bg-teal-100 text-teal-700" },
    { label: "This week's appointments", value: data.stats.weekCount, icon: ClipboardList, color: "bg-blue-100 text-blue-700" },
  ];

  return <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-10">
    <motion.section variants={cardReveal}><span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800"><Stethoscope className="h-3.5 w-3.5" />Doctor Portal</span><h1 className="mt-4 text-3xl tracking-tight text-slate-900 sm:text-4xl">Welcome back, <span className="font-display italic text-cyan-800">Dr. {name}</span>.</h1><p className="mt-2 text-base text-slate-500">Here&apos;s what&apos;s on your schedule today.</p></motion.section>
    <motion.section variants={staggerContainer} className="grid grid-cols-1 gap-4 sm:grid-cols-3">{stats.map(({ label, value, icon: Icon, color }) => <motion.div key={label} variants={cardReveal} className="flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-900/5"><span className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}><Icon className="h-5 w-5" /></span><div><p className="text-2xl font-semibold text-slate-900">{loading ? "—" : value}</p><p className="text-sm text-slate-500">{label}</p></div></motion.div>)}</motion.section>
    <motion.section variants={cardReveal} className="rounded-2xl border border-slate-200/70 bg-white shadow-sm shadow-slate-900/5"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6"><div><h2 className="text-lg font-semibold text-slate-900">Today&apos;s schedule</h2><p className="mt-1 text-sm text-slate-500">Your confirmed and pending consultations.</p></div><Button variant="outline" asChild className="hidden sm:inline-flex"><Link href="/doctor-appointments">View all</Link></Button></div>{loading ? <div className="p-6 text-sm text-slate-500">Loading schedule…</div> : data.appointments.length === 0 ? <div className="p-10 text-center text-sm text-slate-500">No appointments scheduled for today.</div> : <div className="divide-y divide-slate-100">{data.appointments.map((appointment) => <div key={appointment.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div className="flex items-center gap-4"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700"><UserRound className="h-5 w-5" /></span><div><p className="font-semibold text-slate-900">{appointment.patientName}</p><p className="mt-0.5 flex items-center gap-2 text-sm text-slate-500"><Clock className="h-3.5 w-3.5" />{appointment.time}<span>•</span>{appointment.type}</p></div></div><div className="flex gap-2"><Button size="sm" variant="outline" asChild><Link href="/doctor-appointments">View details</Link></Button>{appointment.type === "Video" && <Button size="sm"><Video className="h-4 w-4" />Join call</Button>}</div></div>)}</div>}</motion.section>
    <motion.section variants={staggerContainer}><h2 className="mb-4 text-lg font-semibold text-slate-900">Quick actions</h2><div className="grid gap-4 sm:grid-cols-2"><motion.div variants={cardReveal}><Link href="/doctor-appointments" className="flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-colors hover:border-cyan-300 hover:bg-cyan-50/30"><span className="rounded-xl bg-cyan-100 p-3 text-cyan-700"><CalendarDays className="h-5 w-5" /></span><span><span className="block font-semibold text-slate-900">My Appointments</span><span className="text-sm text-slate-500">View your full schedule</span></span></Link></motion.div><motion.div variants={cardReveal}><Link href="/doctor-profile" className="flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-colors hover:border-cyan-300 hover:bg-cyan-50/30"><span className="rounded-xl bg-cyan-100 p-3 text-cyan-700"><UserRound className="h-5 w-5" /></span><span><span className="block font-semibold text-slate-900">My Profile</span><span className="text-sm text-slate-500">Edit bio, specialty and availability</span></span></Link></motion.div></div></motion.section>
  </motion.div>;
}
