export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-slate-50 to-sky-50 text-slate-900">
      <div className="aurora-blob pointer-events-none fixed -top-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-indigo-400/20 to-cyan-300/20 blur-3xl" />
      <div className="aurora-blob pointer-events-none fixed -bottom-40 -left-32 h-[24rem] w-[24rem] rounded-full bg-gradient-to-tr from-emerald-300/20 to-blue-300/20 blur-3xl" style={{ animationDelay: "5s" }} />
      <div className="relative">{children}</div>
    </div>
  );
}
