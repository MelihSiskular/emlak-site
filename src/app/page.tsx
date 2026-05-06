import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";

type ListingImage = {
  id: string;
  image_url: string;
  sort_order: number;
};

type Listing = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  listing_type: string;
  property_type: string;
  city: string;
  district: string;
  neighborhood: string | null;
  room_count: string | null;
  gross_m2: number | null;
  listing_images?: ListingImage[];
};

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

function formatPropertyType(type: string) {
  if (type === "daire") return "Daire";
  if (type === "arsa") return "Arsa";
  if (type === "isyeri") return "İşyeri";
  return type;
}

export default async function Home() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select("*, listing_images(*)")
    .eq("is_published", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  const listings = (data ?? []) as Listing[];

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
         <Link
  href="/"
  className="flex items-center gap-3 text-xl font-bold tracking-tight text-[#D4AF37]"
>
  <Image
    src="/logo.png"
    alt="Kırklareli Emlak Logo"
    width={40}
    height={40}
    className="rounded-full object-cover"
  />

  <span>Kırklareli Emlak</span>
</Link>

          <nav className="hidden items-center gap-6 md:flex">
            <a href="#hero" className="text-sm text-gray-300 transition hover:text-white">
              Ana Sayfa
            </a>
            <a href="#ilanlar" className="text-sm text-gray-300 transition hover:text-white">
              İlanlar
            </a>
            <a href="#hizmetler" className="text-sm text-gray-300 transition hover:text-white">
              Hizmetler
            </a>
            <a href="#iletisim" className="text-sm text-gray-300 transition hover:text-white">
              İletişim
            </a>
          </nav>

          <a
            href="https://wa.me/905551112233"
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-[#25D366] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1ebe5d]"
          >
            WhatsApp
          </a>
        </div>
      </header>

      <section
        id="hero"
        className="relative overflow-hidden bg-gradient-to-br from-[#111111] via-[#0a0a0a] to-[#151515]"
      >
        <div className="absolute left-[-120px] top-[-80px] h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-80px] h-72 w-72 rounded-full bg-white/5 blur-3xl" />

        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2 md:items-center">
          <div>
           

            <h1 className="mt-6 text-4xl font-bold leading-tight text-white md:text-5xl">
              Hayalinizdeki Evi
              <span className="block text-gray-300">
                Doğru İlanla Buluşturuyoruz
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-gray-400 md:text-lg">
              Satılık ve kiralık ilanları modern, hızlı ve güvenilir bir deneyimle
              keşfedin. Detaylı bilgiler, fotoğraflar ve doğrudan iletişim tek
              sayfada.
            </p>

            

            <div className="mt-10 grid max-w-lg grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-bold text-white">{listings.length}+</p>
                <p className="mt-1 text-sm text-gray-400">Aktif İlan</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-bold text-white">7/24</p>
                <p className="mt-1 text-sm text-gray-400">İletişim</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-bold text-white">Hızlı</p>
                <p className="mt-1 text-sm text-gray-400">Geri Dönüş</p>
              </div>
            </div>
          </div>

 <div className="relative">
  <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl">
  <iframe
  title="Kırklareli Ofis"
  src="https://www.google.com/maps?q=Karakaş%20Mahallesi%20Manolya%20Sk%20No:6%20Kırklareli&z=17&output=embed"
  className="h-[420px] w-full rounded-2xl"
  loading="lazy"
/>
  </div>

  <div className="absolute -bottom-6 -left-4 rounded-2xl border border-white/10 bg-[#111111] p-4 shadow-xl">
    <p className="text-sm text-gray-400">Ofis Konumu</p>
    <p className="mt-1 font-semibold text-white">Kırklareli Merkez</p>
  </div>
</div>
        </div>
      </section>

      <section id="ilanlar" className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-gray-400">
              Portföyümüz
            </p>
            <h2 className="mt-2 text-3xl font-bold text-white">
              Öne Çıkan İlanlar
            </h2>
            <p className="mt-3 max-w-2xl text-gray-400">
              Konum, fiyat ve özellik bakımından öne çıkan ilanları inceleyin.
            </p>
          </div>

          <a
            href="#iletisim"
            className="inline-flex rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Bilgi Al
          </a>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            Hata: {error.message}
          </div>
        )}

        {!error && listings.length === 0 && (
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-6 text-gray-400">
            Henüz yayınlanmış ilan bulunmuyor.
          </div>
        )}

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) => {
            const coverImage =
              listing.listing_images
                ?.slice()
                .sort((a, b) => a.sort_order - b.sort_order)[0]?.image_url ?? null;

            return (
              <Link key={listing.id} href={`/ilan/${listing.slug}`}>
                <article className="group overflow-hidden rounded-2xl border border-white/10 bg-[#111111] shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl">
                  <div className="relative">
                    {coverImage ? (
                      <img
                        src={coverImage}
                        alt={listing.title}
                        className="h-64 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-64 w-full items-center justify-center bg-[#1a1a1a] text-gray-500">
                        Fotoğraf Yok
                      </div>
                    )}

                    <div className="absolute left-4 top-4 flex gap-2">
                      <span className="rounded-full bg-black/75 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                        {formatListingType(listing.listing_type)}
                      </span>

                      <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-black backdrop-blur">
                        {formatPropertyType(listing.property_type)}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="line-clamp-2 text-xl font-semibold text-white">
                      {listing.title}
                    </h3>

                    <p className="mt-3 text-2xl font-bold text-white">
                      {formatPrice(listing.price, listing.currency)}
                    </p>

                    <p className="mt-2 text-sm text-gray-400">
                      {listing.city} / {listing.district}
                      {listing.neighborhood ? ` / ${listing.neighborhood}` : ""}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2 text-sm">
                      {listing.room_count && (
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-gray-300">
                          {listing.room_count}
                        </span>
                      )}
                      {listing.gross_m2 && (
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-gray-300">
                          {listing.gross_m2} m²
                        </span>
                      )}
                    </div>

                    {listing.description && (
                      <p className="mt-4 line-clamp-2 text-sm leading-6 text-gray-400">
                        {listing.description}
                      </p>
                    )}

                    <div className="mt-5 text-sm font-medium text-white">
                      Detayları Gör →
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </section>

      <section id="hizmetler" className="bg-[#111111] py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <p className="text-sm font-medium uppercase tracking-wide text-gray-400">
              Hizmet Anlayışımız
            </p>
            <h2 className="mt-2 text-3xl font-bold text-white">
              Neden Bizi Tercih Etmelisiniz?
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-6">
              <h3 className="text-lg font-semibold text-white">Güvenilir Hizmet</h3>
              <p className="mt-3 text-sm leading-6 text-gray-400">
                Tüm ilanlarımızı düzenli şekilde kontrol ediyor, doğru ve güncel bilgi
                sunmaya özen gösteriyoruz.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-6">
              <h3 className="text-lg font-semibold text-white">Hızlı İletişim</h3>
              <p className="mt-3 text-sm leading-6 text-gray-400">
                Telefon ve WhatsApp üzerinden hızlı geri dönüş sağlayarak karar
                sürecini kolaylaştırıyoruz.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-6">
              <h3 className="text-lg font-semibold text-white">Bölge Uzmanlığı</h3>
              <p className="mt-3 text-sm leading-6 text-gray-400">
                Bölgeyi tanıyor, ihtiyaçlarınıza en uygun ilanları daha hızlı
                bulmanıza yardımcı oluyoruz.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="iletisim" className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#111111] to-[#1a1a1a] px-8 py-12 text-white shadow-2xl">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-sm uppercase tracking-wide text-gray-400">
                İletişim
              </p>
              <h2 className="mt-2 text-3xl font-bold">
                Size Uygun İlan İçin Hemen Ulaşın
              </h2>
              <p className="mt-4 max-w-xl text-gray-400">
                Portföyümüzde yer alan ilanlar hakkında detaylı bilgi almak için
                bize hemen telefon veya WhatsApp üzerinden ulaşabilirsiniz.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 md:justify-end">
              <a
                href="tel:905551112233"
                className="rounded-xl bg-white px-6 py-3 font-medium text-black transition hover:bg-gray-200"
              >
                Telefonla Ara
              </a>
              <a
                href="https://wa.me/905551112233"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-white/15 bg-[#25D366] px-6 py-3 font-medium text-white transition hover:bg-white/10"
              >
                WhatsApp’tan Yaz
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
          <p>© 2026 Kırklareli Emlak. Tüm hakları saklıdır.</p>
          <p>Modern emlak deneyimi için tasarlandı.</p>
        </div>
      </footer>
    </main>
  );
}