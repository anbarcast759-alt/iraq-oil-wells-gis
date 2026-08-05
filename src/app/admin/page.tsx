import { cookies } from "next/headers";
import { SESSION_COOKIE, isValidSessionToken } from "@/lib/adminAuth";
import AdminLoginForm from "./AdminLoginForm";
import AdminPanel from "./AdminPanel";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const authenticated = isValidSessionToken(token);

  return (
    <main className="min-h-screen p-6 md:p-10 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-brand-gold mb-6">Admin Panel</h1>
      {authenticated ? <AdminPanel /> : <AdminLoginForm />}
    </main>
  );
}
