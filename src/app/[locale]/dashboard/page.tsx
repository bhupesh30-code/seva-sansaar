"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { 
  Shield, 
  TrendingUp, 
  Users, 
  Star, 
  Clock,
  Briefcase,
  ChevronRight
} from "lucide-react";
import { ownerAuthHeader, readOwnerSession } from "@/lib/ownerClient";
import { VerificationBadge } from "@/components/VerificationBadge";

type Biz = {
   name: string;
   status: string;
   verified: boolean;
   city: string;
   category: string;
   totalBookings?: number;
   completedBookings?: number;
   activeRequests?: number;
   totalEarnings?: number;
   completionRate?: number;
   rating?: number;
   reviews?: number;
   dailyEarnings?: number;
   weeklyEarnings?: number;
};

export default function OwnerDashboardHome() {
  const [biz, setBiz] = useState<Biz | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const s = readOwnerSession();
    if (!s) return;
    void (async () => {
      try {
        const res = await fetch("/api/owner/business", { headers: { ...ownerAuthHeader() } });
        if (!res.ok) throw new Error();
        const data = (await res.json()) as Biz;
        setBiz(data);
      } catch {
        setErr("Could not load your session.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
     return (
       <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse flex flex-col items-center gap-4">
             <div className="h-12 w-12 rounded-2xl bg-gray-100" />
             <div className="h-4 w-32 bg-gray-50 rounded-full" />
          </div>
       </div>
     );
  }

  const isPending = biz?.status === "pending";

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-navy tracking-tight italic">
            Dashboard
          </h1>
          <p className="text-sm font-medium text-gray-400">Everything you need to grow your {biz?.category} business.</p>
        </div>
        
        {isPending && (
          <div className="flex items-center gap-4 bg-amber-500/5 border border-amber-500/10 px-6 py-4 rounded-3xl animate-in zoom-in duration-500">
             <div className="h-10 w-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                <Clock size={20} className="animate-spin-slow" />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Status: Under Review</p>
                <p className="text-[10px] font-bold text-amber-900/40">You&apos;ll be live in Jamshedpur within 24 hours.</p>
             </div>
          </div>
        )}
      </div>

      {err && (
        <p className="rounded-3xl border border-red-100 bg-red-50 px-6 py-4 text-xs font-bold text-red-500 uppercase tracking-widest">{err}</p>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Earnings Card */}
        <div className="md:col-span-2 relative overflow-hidden rounded-[3rem] bg-navy p-10 text-white shadow-2xl shadow-navy/20">
           <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Revenue Estimate</p>
                 <h2 className="text-6xl font-black mt-4 italic">₹{(biz?.totalEarnings ?? 0).toFixed(2)}</h2>
                 <p className="text-xs font-bold text-white/60 mt-2 flex items-center gap-2">
                 <TrendingUp size={14} className="text-emerald-400" /> 
                    Calculated from completed bookings
                 </p>
              </div>
              <div className="mt-12 flex items-center gap-4">
                 <button className="h-12 px-8 rounded-full bg-white text-navy text-[10px] font-black uppercase tracking-widest transition-all hover:scale-110 active:scale-95">
                    Withdraw
                 </button>
                 <button className="h-12 px-8 rounded-full bg-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/20">
                    Detailed Report
                 </button>
              </div>
           </div>
           <div className="absolute top-0 right-0 p-10 opacity-10">
              <TrendingUp size={160} />
           </div>
           <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        </div>

        {/* Status Check Card */}
        <div className="rounded-[3rem] border-2 border-gray-50 bg-white p-10 shadow-sm flex flex-col justify-between">
           <div>
              <div className="flex items-start justify-between">
                 <div className="h-14 w-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400">
                    <Shield size={28} />
                 </div>
                 <VerificationBadge verified={!!biz?.verified} />
              </div>
              <h3 className="mt-6 text-xl font-black text-navy uppercase tracking-tight">{biz?.name || "..."}</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{biz?.category}</p>
           </div>
           <Link
             href="/dashboard/listing"
             className="mt-10 group flex items-center justify-between rounded-2xl bg-gray-50 p-4 transition-all hover:bg-navy hover:text-white"
           >
             <span className="text-[10px] font-black uppercase tracking-widest">Manage Service</span>
             <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
           </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
         <MetricBox label="Active Requests"value={String(biz?.activeRequests ?? 0)}icon={<Clock size={20} />}active/>
         <MetricBox label="Total Bookings"value={String(biz?.totalBookings ?? 0)}icon={<Briefcase size={20} />}/>
         <div className="rounded-2xl border border-gray-100 bg-white p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
               Customer Rating
            </p>
            <div className="mt-3 flex items-end gap-2">
               <span className="text-3xl font-black text-navy">
                  {biz?.rating !== undefined ? biz.rating.toFixed(1) : "0.0"}
               </span>
               <span className="mb-1 text-sm text-gray-400">/ 5</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs font-bold text-gray-500">
               <Star size={14} />
               {biz?.reviews ?? 0} reviews
            </div>
            </div>
         <MetricBox label="Followers" value="0" icon={<Users size={20} />} />
      </div>
      <div className="rounded-[3rem] border-2 border-gray-50 bg-white p-10 shadow-sm">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                  Performance
               </p>
               <h2 className="text-2xl font-black text-navy mt-2">
                  Service Performance
               </h2>
               <p className="text-xs font-medium text-gray-400 mt-1">
                  Overview of your completed service jobs.
               </p>
            </div>

            <div className="text-right">
               <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Completion Rate
               </p>
               <p className="text-4xl font-black text-navy mt-1">
                  {biz?.completionRate ?? 0}%
               </p>
            </div>
         </div>

         <div className="grid gap-4 md:grid-cols-3 mt-8">
            <PerformanceStat
               label="Completed Jobs"
               value={String(biz?.completedBookings ?? 0)}
            />

            <PerformanceStat
               label="Daily Earnings"
               value={`₹${(biz?.dailyEarnings ?? 0).toFixed(2)}`}
            />

            <PerformanceStat
            label="Weekly Earnings"
            value={`₹${(biz?.weeklyEarnings ?? 0).toFixed(2)}`}
            />

            <PerformanceStat
               label="Total Jobs"
               value={String(biz?.totalBookings ?? 0)}
            />

            <PerformanceStat
               label="Active Requests"
               value={String(biz?.activeRequests ?? 0)}
            />
         </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
         <ActionCard 
            title="Update Packages" 
            desc="Change your service pricing and descriptions." 
            href="/dashboard/listing"
            icon={<Briefcase size={24} />}
         />
         <ActionCard 
            title="Review Bookings" 
            desc="You have 0 pending service requests." 
            href="/dashboard/bookings"
            icon={<Clock size={24} />}
            alert={false}
         />
         <ActionCard 
            title="Account Settings" 
            desc="Manage certificates and verification docs." 
            href="/dashboard/settings"
            icon={<Shield size={24} />}
         />
      </div>
    </div>
  );
}

function MetricBox({ label, value, icon, active = false }: { label: string; value: string; icon: React.ReactNode; active?: boolean }) {
  return (
    <div className={`rounded-3xl border-2 p-8 transition-all hover:-translate-y-1 ${active ? "border-navy bg-navy/5 shadow-xl shadow-navy/5" : "border-gray-50 bg-white hover:border-gray-100"}`}>
       <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${active ? "bg-navy text-white" : "bg-gray-50 text-gray-400"}`}>
          {icon}
       </div>
       <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{label}</p>
       <h4 className="text-3xl font-black text-navy">{value}</h4>
    </div>
  );
}

function PerformanceStat({label,value,}: {label: string; value: string;}) {
  return (
    <div className="rounded-2xl bg-gray-50 p-6">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
        {label}
      </p>
      <p className="text-3xl font-black text-navy mt-2">{value}</p>
    </div>
  );
}

function ActionCard({ title, desc, icon, href, alert = false }: { title: string; desc: string; icon: React.ReactNode; href: string; alert?: boolean }) {
  return (
    <Link href={href} className="group flex flex-col rounded-[2.5rem] border-2 border-gray-50 bg-white p-10 shadow-sm transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-gray-200/50">
       <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-gray-300 group-hover:bg-navy group-hover:text-white transition-all duration-500">
          {icon}
       </div>
       <div className="flex items-center gap-2">
          <h5 className="text-lg font-black text-navy tracking-tight uppercase">{title}</h5>
          {alert && <div className="h-2 w-2 rounded-full bg-red-500 animate-ping" />}
       </div>
       <p className="mt-2 text-xs font-medium text-gray-400 leading-relaxed italic">{desc}</p>
       <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-navy">
          Explore <ChevronRight size={14} className="transition-transform group-hover:translate-x-2" />
       </div>
    </Link>
  );
}
