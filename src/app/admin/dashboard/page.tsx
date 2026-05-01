import { requireAdmin } from "@/lib/auth";
import LogoutButton from "@/components/admin/logout-button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { count: totalListings } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true });

  const { count: publishedListings } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("is_published", true);

  const { count: featuredListings } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("is_featured", true);

  return (
    <main className="min-h-screen bg-[#0a0a0a] p-6 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#D4AF37]">
              Admin Panel
            </h1>
            <p className="mt-2 text-gray-400">
              İlanlarınızı buradan yönetin.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/admin/ilanlar"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
            >
              İlanlar
            </Link>

            <Link
              href="/admin/ilanlar/yeni"
              className="rounded-xl bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#c9a72f]"
            >
              Yeni İlan
            </Link>
            <LogoutButton />
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[#111111] p-6">
            <p className="text-sm text-gray-400">Toplam İlan</p>
            <p className="mt-3 text-4xl font-bold">{totalListings ?? 0}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111111] p-6">
            <p className="text-sm text-gray-400">Yayındaki İlan</p>
            <p className="mt-3 text-4xl font-bold">{publishedListings ?? 0}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111111] p-6">
            <p className="text-sm text-gray-400">Öne Çıkan</p>
            <p className="mt-3 text-4xl font-bold">{featuredListings ?? 0}</p>
          </div>
        </div>
      </div>
    </main>
  );
}