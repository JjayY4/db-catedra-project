export default function CompleteProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 py-8">
      <div className="mb-6 text-center">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">MediSystem</p>
      </div>
      {children}
    </div>
  )
}
