import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

type PageProps = {
  params: Promise<{ slug: string }>;
};

type ListingImage = {
  id: string;
  image_url: string;
  sort_order: number;
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
  if (type === "villa") return "Villa";
  return type;
}

export default async function ListingDetail({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select("*, listing_images(*)")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !data) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] px-6 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="text-red-400">İlan bulunamadı.</p>
          <Link href="/" className="mt-4 inline-block text-sm text-gray-400 underline">
            Ana sayfaya dön
          </Link>
        </div>
      </main>
    );
  }

  const images = ((data.listing_images ?? []) as ListingImage[])
  .slice()
  .sort((a, b) => a.sort_order - b.sort_order);

  const mainImage = images[0]?.image_url ?? null;
  const sideImages = images.slice(1, 5);

  const whatsappMessage = `Merhaba, ${data.title} ilanı hakkında bilgi almak istiyorum.`;
  const whatsappUrl = data.whatsapp_phone
    ? `https://wa.me/${data.whatsapp_phone}?text=${encodeURIComponent(whatsappMessage)}`
    : null;

  const mapUrl =
  data.latitude && data.longitude
    ? `https://www.google.com/maps?q=${data.latitude},${data.longitude}&z=17&output=embed`
    : null;

  const detailItems = [
    { label: "Emlak Tipi", value: formatPropertyType(data.property_type) },
    { label: "İlan Türü", value: formatListingType(data.listing_type) },
    { label: "Brüt m²", value: data.gross_m2 ? `${data.gross_m2}` : null },
    { label: "Net m²", value: data.net_m2 ? `${data.net_m2}` : null },
    { label: "Oda Sayısı", value: data.room_count || null },
    { label: "Banyo Sayısı", value: data.bathroom_count ? `${data.bathroom_count}` : null },
    { label: "Bulunduğu Kat", value: data.floor_number || null },
    { label: "Bina Yaşı", value: data.building_age ? `${data.building_age}` : null },
    { label: "Mahalle", value: data.neighborhood || null },
    { label: "İl / İlçe", value: `${data.city} / ${data.district}` },
    { label: "Isıtma", value: data.heating_type || null },
    { label: "Otopark", value: data.parking || null },
    { label: "Aidat", value: data.dues ? `${data.dues} ₺` : null },
    { label: "Kullanım Durumu", value: data.usage_status || null },
    { label: "Tapu Durumu", value: data.deed_status || null },
    { label: "Eşyalı", value: data.furnished ? "Evet" : null },
    { label: "Site İçinde", value: data.in_site ? "Evet" : null },
    { label: "Balkon", value: data.balcony ? "Var" : null },
    { label: "Asansör", value: data.elevator ? "Var" : null },
    { label: "Krediye Uygun", value: data.credit_eligible ? "Evet" : null },
  ].filter((item) => item.value);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <Link href="/" className="text-sm text-gray-400 transition hover:text-[#D4AF37]">
          ← Ana sayfaya dön
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-[#D4AF37] px-4 py-1.5 text-sm font-medium text-black">
            {formatListingType(data.listing_type)}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-gray-200">
            {formatPropertyType(data.property_type)}
          </span>
        </div>

        <h1 className="mt-4 max-w-5xl text-3xl font-bold leading-tight text-white md:text-4xl">
          {data.title}
        </h1>

        <p className="mt-3 text-base text-gray-400 md:text-lg">
          {data.city} / {data.district}
          {data.neighborhood ? ` / ${data.neighborhood}` : ""}
        </p>

        <section className="mt-8 grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {mainImage ? (
              <img
                src={mainImage}
                alt={data.title}
                className="h-[420px] w-full rounded-3xl border border-white/10 object-cover md:h-[520px]"
              />
            ) : (
              <div className="flex h-[420px] w-full items-center justify-center rounded-3xl border border-white/10 bg-[#141414] text-gray-500 md:h-[520px]">
                Fotoğraf yok
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-2">
            {sideImages.length > 0 ? (
              sideImages.map((img) => (
                <img
                  key={img.id}
                  src={img.image_url}
                  alt={data.title}
                  className="h-[200px] w-full rounded-2xl border border-white/10 object-cover md:h-[250px]"
                />
              ))
            ) : (
              <>
                <div className="rounded-2xl border border-white/10 bg-[#141414]" />
                <div className="rounded-2xl border border-white/10 bg-[#141414]" />
                <div className="rounded-2xl border border-white/10 bg-[#141414]" />
                <div className="rounded-2xl border border-white/10 bg-[#141414]" />
              </>
            )}
          </div>
        </section>

        <section className="mt-8 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="flex flex-wrap gap-3">
              <a
                href="#aciklama"
                className="rounded-full bg-[#D4AF37] px-5 py-2.5 text-sm font-medium text-black"
              >
                Açıklama
              </a>
              <a
                href="#ozellikler"
                className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-gray-200 transition hover:bg-white/10"
              >
                Özellikler
              </a>
              <a
                href="#konum"
                className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-gray-200 transition hover:bg-white/10"
              >
                Konum
              </a>
            </div>

            <div
              id="aciklama"
              className="mt-8 rounded-3xl border border-white/10 bg-[#111111] p-6 shadow-xl md:p-8"
            >
              <h2 className="text-2xl font-bold text-white">İlan Açıklaması</h2>
              <div className="mt-5 space-y-4 text-[15px] leading-8 text-gray-300">
                <p>{data.description || "Bu ilan için açıklama eklenmemiş."}</p>
              </div>
            </div>

            <div
              id="ozellikler"
              className="mt-8 rounded-3xl border border-white/10 bg-[#111111] p-6 shadow-xl md:p-8"
            >
              <h2 className="text-2xl font-bold text-white">İlan Özellikleri</h2>

              <div className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {detailItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-2xl border border-white/5 bg-[#181818] px-4 py-4"
                  >
                    <span className="text-sm text-gray-400">{item.label}</span>
                    <span className="text-sm font-semibold text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-white/10 bg-[#111111] p-6 shadow-xl md:p-8">
              <h2 className="text-2xl font-bold text-white">Ek Bilgiler</h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/5 bg-[#181818] p-5">
                  <p className="text-sm text-gray-400">İletişim Telefonu</p>
                  <p className="mt-2 font-semibold text-white">
                    {data.phone || "Belirtilmemiş"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/5 bg-[#181818] p-5">
                  <p className="text-sm text-gray-400">WhatsApp</p>
                  <p className="mt-2 font-semibold text-white">
                    {data.whatsapp_phone || "Belirtilmemiş"}
                  </p>
                </div>
              </div>
            </div>

            {mapUrl && (
              <div
                id="konum"
                className="mt-8 rounded-3xl border border-white/10 bg-[#111111] p-6 shadow-xl md:p-8"
              >
<h2 className="text-2xl font-bold text-white flex items-center gap-2">
  📍 Konum
</h2>
                <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
                  <iframe
                    title="İlan Konumu"
                    src={mapUrl}
                    className="h-[360px] w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />

                  <a
  href={`https://www.google.com/maps?q=${data.latitude},${data.longitude}`}
  target="_blank"
  rel="noreferrer"
  className="mt-4 inline-block rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-gray-200"
>
  Google Maps’te Aç
</a>
                </div>

                {data.address && (
                  <p className="mt-4 text-sm text-gray-400">{data.address}</p>
                )}
              </div>
            )}
          </div>

          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <div className="rounded-3xl border border-white/10 bg-[#111111] p-6 shadow-xl">
                <p className="text-3xl font-bold text-[#D4AF37]">
                  {formatPrice(data.price, data.currency)}
                </p>

                <p className="mt-3 text-sm leading-6 text-gray-400">
                  {data.city} / {data.district}
                  {data.neighborhood ? ` / ${data.neighborhood}` : ""}
                </p>

                <div className="mt-6 space-y-3">
                  {data.phone && (
                    <a
                      href={`tel:${data.phone}`}
                      className="block w-full rounded-2xl bg-white px-5 py-4 text-center font-medium text-black transition hover:bg-gray-200"
                    >
                      Telefonla Ara
                    </a>
                  )}

                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block w-full rounded-2xl bg-[#25D366] px-5 py-4 text-center font-medium text-white transition hover:bg-[#1ebe5d]"
                    >
                      WhatsApp’tan Yaz
                    </a>
                  )}
                </div>

                <div className="mt-8 border-t border-white/10 pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Emlak Tipi</span>
                      <span className="font-semibold text-white">
                        {formatPropertyType(data.property_type)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">İlan Türü</span>
                      <span className="font-semibold text-white">
                        {formatListingType(data.listing_type)}
                      </span>
                    </div>

                    {data.room_count && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Oda Sayısı</span>
                        <span className="font-semibold text-white">
                          {data.room_count}
                        </span>
                      </div>
                    )}

                    {data.gross_m2 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Brüt m²</span>
                        <span className="font-semibold text-white">
                          {data.gross_m2}
                        </span>
                      </div>
                    )}

                    {data.net_m2 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Net m²</span>
                        <span className="font-semibold text-white">
                          {data.net_m2}
                        </span>
                      </div>
                    )}

                    {data.floor_number && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Kat</span>
                        <span className="font-semibold text-white">
                          {data.floor_number}
                        </span>
                      </div>
                    )}

                    {data.building_age && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Bina Yaşı</span>
                        <span className="font-semibold text-white">
                          {data.building_age}
                        </span>
                      </div>
                    )}

                    {data.heating_type && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Isıtma</span>
                        <span className="font-semibold text-white">
                          {data.heating_type}
                        </span>
                      </div>
                    )}

                    {data.parking && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Otopark</span>
                        <span className="font-semibold text-white">
                          {data.parking}
                        </span>
                      </div>
                    )}

                    {data.dues && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Aidat</span>
                        <span className="font-semibold text-white">
                          {data.dues} ₺
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}