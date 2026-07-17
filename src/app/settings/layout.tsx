import { SignOutButton } from "@/components/dashboard/sign-out-button";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-sky-50 text-slate-900">
      <div className="aurora-blob pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-gradient-to-tr from-indigo-400/25 to-cyan-300/25 blur-3xl" />
      <header className="relative flex items-center justify-between border-b border-slate-200/70 bg-white/70 px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <span className="bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-500 bg-clip-text font-bold text-transparent">
            Hergé
          </span>
        </div>
        <SignOutButton />
      </header>
      <main className="relative p-6">{children}</main>
    </div>
  );
}
