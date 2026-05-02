import { DashboardNav } from "@/components/DashboardNav";

// TODO: Add auth check middleware to protect this layout
// Unauthenticated users should be redirected to /auth/login

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
