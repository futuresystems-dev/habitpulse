"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ListTodo, BarChart3, User } from "lucide-react";

const navItems = [
  { href: "/habits/today", label: "Today", icon: Home },
  { href: "/habits", label: "Habits", icon: ListTodo },
  { href: "/summary", label: "Summary", icon: BarChart3 },
  { href: "/account", label: "Account", icon: User },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop: Top Nav Bar */}
      <nav className="hidden md:flex sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl flex items-center justify-between px-4 md:px-6 h-16">
          <Link href="/habits/today" className="text-xl font-bold text-primary">
            HabitPulse
          </Link>
          <div className="flex items-center gap-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-semibold transition-colors ${
                    isActive
                      ? "text-primary border-b-2 border-primary pb-1"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile: Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white z-40 safe-area-inset-bottom">
        <div className="flex items-center justify-around h-20">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                  isActive ? "text-primary" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Spacer for mobile bottom nav */}
      <div className="md:hidden h-20" />
    </>
  );
}
