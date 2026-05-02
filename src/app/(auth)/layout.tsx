export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4 py-8">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
