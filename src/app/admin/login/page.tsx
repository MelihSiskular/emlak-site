"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMessage("Giriş başarısız. E-posta veya şifreyi kontrol edin.");
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111111] p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-[#D4AF37]">
          Kırklareli Emlak
        </h1>

        <p className="mt-2 text-sm text-gray-400">
          İlan yönetim paneline giriş yapın.
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm text-gray-300">
              E-posta
            </label>
            <input
              type="email"
              className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 text-white outline-none transition focus:border-[#D4AF37]"
              placeholder="admin@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Şifre
            </label>
            <input
              type="password"
              className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 text-white outline-none transition focus:border-[#D4AF37]"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {errorMessage && (
            <p className="text-sm text-red-400">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#D4AF37] px-4 py-3 font-semibold text-black transition hover:bg-[#c9a72f] disabled:opacity-60"
          >
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>
      </div>
    </main>
  );
}