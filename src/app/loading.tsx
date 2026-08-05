export default function Loading() {
  return (
    <main className="min-h-screen p-6 md:p-10 animate-pulse">
      <div className="h-8 w-72 bg-white/10 rounded mb-2" />
      <div className="h-4 w-96 bg-white/5 rounded mb-8" />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-card h-24" />
        ))}
      </div>

      <div className="glass-card h-[480px]" />
    </main>
  );
}
