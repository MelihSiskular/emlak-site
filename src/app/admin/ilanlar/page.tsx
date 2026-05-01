import ListingToggleButton from "@/components/admin/listing-toggle-button";
import { requireAdmin } from "@/lib/auth";
import LogoutButton from "@/components/admin/logout-button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: currency || "TRY",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatListingType(type: string) {
  if (type === "satilik") return "Satılık";
  if (type === "kiralik") return "Kiralık";
  return type;
}

export default async function AdminListingsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: listings, error } = await supabase
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-[#0a0a0a] p-6 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/admin/dashboard"
              className="text-sm text-gray-400 hover:text-white"
            >
              ← Dashboard
            </Link>

            <h1 className="mt-3 text-3xl font-bold text-[#D4AF37]">
              İlanlar
            </h1>

            <p className="mt-2 text-gray-400">
              Yayındaki ve taslaktaki ilanları buradan yönetin.
            </p>
          </div>

          <Link
            href="/admin/ilanlar/yeni"
            className="rounded-xl bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#c9a72f]"
          >
            Yeni İlan Ekle
          </Link>
          <LogoutButton />
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            Hata: {error.message}
          </div>
        )}

        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-white/10 bg-white/5 text-gray-300">
                <tr>
                  <th className="px-5 py-4">Başlık</th>
                  <th className="px-5 py-4">Fiyat</th>
                  <th className="px-5 py-4">Tür</th>
                  <th className="px-5 py-4">Konum</th>
                  <th className="px-5 py-4">Durum</th>
                  <th className="px-5 py-4">Öne Çıkan</th>
                  <th className="px-5 py-4 text-right">İşlem</th>
                </tr>
              </thead>

              <tbody>
                {listings?.map((listing) => (
                  <tr
                    key={listing.id}
                    className="border-b border-white/10 last:border-b-0"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-white">
                          {listing.title}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          /ilan/{listing.slug}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-semibold text-white">
                      {formatPrice(listing.price, listing.currency)}
                    </td>

                    <td className="px-5 py-4 text-gray-300">
                      {formatListingType(listing.listing_type)}
                    </td>

                    <td className="px-5 py-4 text-gray-300">
                      {listing.city} / {listing.district}
                    </td>

                <td className="px-5 py-4">
  <ListingToggleButton
    listingId={listing.id}
    field="is_published"
    value={listing.is_published}
    trueLabel="Yayında"
    falseLabel="Taslak"
  />
</td>

                <td className="px-5 py-4">
  <ListingToggleButton
    listingId={listing.id}
    field="is_featured"
    value={listing.is_featured}
    trueLabel="Evet"
    falseLabel="Hayır"
  />
</td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/ilan/${listing.slug}`}
                          target="_blank"
                          className="rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-300 hover:bg-white/10"
                        >
                          Gör
                        </Link>

                        <Link
                          href={`/admin/ilanlar/${listing.id}/duzenle`}
                          className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-black hover:bg-gray-200"
                        >
                          Düzenle
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}

                {listings?.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-10 text-center text-gray-400"
                    >
                      Henüz ilan yok.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}