import Link from "next/link";

export default function WellNotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 text-center">
      <div>
        <p className="text-brand-gold font-semibold mb-2">Well not found</p>
        <p className="text-sm text-white/60 mb-6">
          This well doesn&apos;t exist, or its name changed in the sheet
          (the URL is derived from Well_Name).
        </p>
        <Link
          href="/"
          className="bg-brand-gold text-brand-navy font-medium rounded-lg px-4 py-2 text-sm"
        >
          Back to all wells
        </Link>
      </div>
    </main>
  );
}
