"use client";

import { Link, usePathname, useRouter } from "@/i18n/navigation";
import {
  BarChart3,
  Calendar,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  Store,
} from "lucide-react";
import { useEffect, useState } from "react";
import { OwnerOnboardingTour } from "@/components/dashboard/OwnerOnboardingTour";
import { clearOwnerSession, readOwnerSession } from "@/lib/ownerClient";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Onboarding / KYC", href: "/dashboard/onboarding", icon: ShieldCheck },
  { name: "My listing", href: "/dashboard/listing", icon: Store },
  { name: "Bookings", href: "/dashboard/bookings", icon: ClipboardList },
  { name: "Availability", href: "/dashboard/calendar", icon: Calendar },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Profile & settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    const s = readOwnerSession();
    if (!s?.businessId || !s?.ownerSecret) {
      const target = pathname || "/dashboard";
      router.replace(`/owner/login?redirect=${encodeURIComponent(target)}`);
      setOk(false);
      return;
    }
    setOk(true);
  }, [router, pathname]);

  const signOut = () => {
    clearOwnerSession();
    router.replace("/owner/login");
  };

  if (ok !== true) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f1f4f9]">
        <p className="rounded-xl border border-gray-200 bg-white px-6 py-4 text-sm font-medium text-gray-600 shadow-sm">
          Checking your session…
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f1f4f9]">
      <OwnerOnboardingTour />
      <aside className="fixed inset-y-0 left-0 z-50 w-72 border-r border-gray-200 bg-white">
        <div className="flex h-20 items-center border-b border-gray-100 px-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Business owner</p>
            <p className="text-lg font-black text-[#1a2d5c]">Seva Sansaar</p>
          </div>
        </div>
        <nav className="space-y-1 p-3">
          {navigation.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                data-tour={item.href === "/dashboard" ? "nav-overview" : undefined}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
                  active ? "bg-[#1a2d5c] text-white shadow-md" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-full border-t border-gray-100 p-4">
          <button
            type="button"
            onClick={signOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="ml-72 flex-1">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white/90 px-8 backdrop-blur">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <CalendarDays size={14} />
            Owner portal
          </div>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
