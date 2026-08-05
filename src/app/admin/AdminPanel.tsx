"use client";

import { useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import {
  RefreshCw,
  Users,
  FileText,
  Image as ImageIcon,
  Database,
  Settings,
  LogOut,
} from "lucide-react";

export default function AdminPanel() {
  const [status, setStatus] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  async function handleRefresh() {
    setRefreshing(true);
    setStatus(null);
    try {
      const res = await fetch("/api/wells?refresh=1");
      const data = await res.json();
      if (!res.ok) {
        setStatus(`Error: ${data.error ?? "failed to refresh"}`);
        return;
      }
      setStatus(
        `Synced ${data.wells.length} well(s) at ${new Date(
          data.fetchedAt
        ).toLocaleTimeString()}.`
      );
      router.refresh();
    } catch {
      setStatus("Error: could not reach the sheet.");
    } finally {
      setRefreshing(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-5">
        <h2 className="text-sm text-white/50 mb-3">Data Sync</h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 bg-brand-gold text-brand-navy font-medium rounded-lg px-4 py-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing…" : "Refresh Google Sheet"}
        </button>
        {status && <p className="mt-3 text-sm text-white/60">{status}</p>}
      </div>

      <div>
        <h2 className="text-sm text-white/50 mb-3">More tools</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <AdminStub icon={Users} label="Manage Users" />
          <AdminStub icon={FileText} label="Upload PDFs" />
          <AdminStub icon={ImageIcon} label="Upload Images" />
          <AdminStub icon={Database} label="Upload LAS Files" />
          <AdminStub icon={Settings} label="Site Settings" />
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white"
      >
        <LogOut className="w-4 h-4" />
        Sign out
      </button>
    </div>
  );
}

function AdminStub({
  icon: Icon,
  label,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="glass-card p-4 text-center text-white/30">
      <Icon className="w-5 h-5 mx-auto mb-2" />
      <p className="text-xs">{label}</p>
      <p className="text-[10px] mt-1">Coming soon</p>
    </div>
  );
}
