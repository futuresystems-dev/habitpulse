import { DashboardNav } from "@/components/DashboardNav";

// Auth protection is handled by middleware.ts which checks Supabase session
// and redirects unauthenticated users to /login

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <DashboardNav />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 md:px-6 py-6 md:py-8">
        {children}
      </main>
    </div>
  );
}
