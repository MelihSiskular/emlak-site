"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

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
  gross_m2: number | null;
  net_m2: number | null;
  room_count: string | null;
  bathroom_count: number | null;
  floor_number: string | null;
  building_age: number | null;
  address: string | null;
  phone: string | null;
  whatsapp_phone: string | null;
  is_featured: boolean;
  is_published: boolean;
  heating_type: string | null;
parking: string | null;
furnished: boolean;
in_site: boolean;
dues: number | null;
balcony: boolean;
elevator: boolean;
credit_eligible: boolean;
usage_status: string | null;
deed_status: string | null;
map_embed_url: string | null;
latitude: string | null;
longitude: string | null;
};

type ListingImage = {
  id: string;
  listing_id: string;
  image_url: string;
  sort_order: number;
};

function createSlug(text: string) {
  return text
    .toLowerCase()
    .replaceAll("ı", "i")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function EditListingPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();
  useEffect(() => {
  async function checkAuth() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/admin/login");
      router.refresh();
    }
  }

  checkAuth();
}, [router, supabase]);

  const [listing, setListing] = useState<Listing | null>(null);
  const [images, setImages] = useState<ListingImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchListing() {
      setLoading(true);

      const { data, error } = await supabase
        .from("listings")
        .select("*, listing_images(*)")
        .eq("id", params.id)
        .single();

      if (error || !data) {
        setErrorMessage(error?.message || "İlan bulunamadı.");
        setLoading(false);
        return;
      }

      setListing(data as Listing);
      setImages((data.listing_images ?? []) as ListingImage[]);
      setLoading(false);
    }

    fetchListing();
  }, [params.id, supabase]);

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!listing) return;

    setSaving(true);
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);

    const title = String(formData.get("title"));
    const newSlug = createSlug(title);
const contactPhone = String(formData.get("contact_phone"));
    const payload = {
      title,
      slug: newSlug,
      description: String(formData.get("description")),
      price: Number(formData.get("price")),
      currency: "TRY",
      listing_type: String(formData.get("listing_type")),
      property_type: String(formData.get("property_type")),
      city: String(formData.get("city")),
      district: String(formData.get("district")),
      neighborhood: String(formData.get("neighborhood")),
      gross_m2: Number(formData.get("gross_m2")) || null,
      net_m2: Number(formData.get("net_m2")) || null,
      room_count: String(formData.get("room_count")),
      bathroom_count: Number(formData.get("bathroom_count")) || null,
      floor_number: String(formData.get("floor_number")),
      building_age: Number(formData.get("building_age")) || null,
      address: String(formData.get("address")),
phone: contactPhone,
whatsapp_phone: contactPhone,
      is_featured: formData.get("is_featured") === "on",
      is_published: formData.get("is_published") === "on",
heating_type: String(formData.get("heating_type")),
parking: String(formData.get("parking")),
furnished: formData.get("furnished") === "on",
in_site: formData.get("in_site") === "on",
dues: Number(formData.get("dues")) || null,
balcony: formData.get("balcony") === "on",
elevator: formData.get("elevator") === "on",
credit_eligible: formData.get("credit_eligible") === "on",
usage_status: String(formData.get("usage_status")),
deed_status: String(formData.get("deed_status")),
map_embed_url: String(formData.get("map_embed_url")),
latitude: String(formData.get("latitude")),
longitude: String(formData.get("longitude")),
      
      
    };

    const { error } = await supabase
      .from("listings")
      .update(payload)
      .eq("id", listing.id);

    if (error) {
      setSaving(false);
      setErrorMessage(error.message);
      return;
    }

    const imageFiles = formData.getAll("images") as File[];
    const validImages = imageFiles.filter((file) => file.size > 0);

    if (validImages.length > 0) {
      const imageRows = [];

      for (let i = 0; i < validImages.length; i++) {
        const file = validImages[i];

        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${i}.${fileExt}`;
        const filePath = `${listing.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("listing-images")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) {
          setSaving(false);
          setErrorMessage(`Fotoğraf yüklenemedi: ${uploadError.message}`);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from("listing-images")
          .getPublicUrl(filePath);

        imageRows.push({
          listing_id: listing.id,
          image_url: publicUrlData.publicUrl,
          sort_order: images.length + i + 1,
        });
      }

      const { error: imageInsertError } = await supabase
        .from("listing_images")
        .insert(imageRows);

      if (imageInsertError) {
        setSaving(false);
        setErrorMessage(imageInsertError.message);
        return;
      }
    }

    setSaving(false);
    router.push("/admin/ilanlar");
    router.refresh();
  }

  async function handleDeleteListing() {
    if (!listing) return;

    const confirmed = window.confirm(
      "Bu ilanı silmek istediğine emin misin? Bu işlem geri alınamaz."
    );

    if (!confirmed) return;

    setSaving(true);
    setErrorMessage("");

    const { error } = await supabase
      .from("listings")
      .delete()
      .eq("id", listing.id);

    if (error) {
      setSaving(false);
      setErrorMessage(error.message);
      return;
    }

    setSaving(false);
    router.push("/admin/ilanlar");
    router.refresh();
  }

  async function handleDeleteImage(image: ListingImage) {
    const confirmed = window.confirm("Bu fotoğraf silinsin mi?");
    if (!confirmed) return;

    setSaving(true);
    setErrorMessage("");

    const { error } = await supabase
      .from("listing_images")
      .delete()
      .eq("id", image.id);

    if (error) {
      setSaving(false);
      setErrorMessage(error.message);
      return;
    }

    setImages((prev) => prev.filter((img) => img.id !== image.id));
    setSaving(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] p-6 text-white">
        <p>Yükleniyor...</p>
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] p-6 text-white">
        <p className="text-red-400">İlan bulunamadı.</p>
        <Link href="/admin/ilanlar" className="mt-4 inline-block text-gray-400">
          ← İlanlara dön
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] p-6 text-white">
      <div className="mx-auto max-w-5xl">
        <Link href="/admin/ilanlar" className="text-sm text-gray-400 hover:text-white">
          ← İlanlara dön
        </Link>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#D4AF37]">
              İlanı Düzenle
            </h1>
            <p className="mt-2 text-gray-400">{listing.title}</p>
          </div>

          <button
            onClick={handleDeleteListing}
            disabled={saving}
            className="rounded-xl bg-red-500/15 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/25 disabled:opacity-60"
          >
            İlanı Sil
          </button>
        </div>

        <form
          onSubmit={handleUpdate}
          className="mt-8 grid gap-5 rounded-3xl border border-white/10 bg-[#111111] p-6"
        >
          <div>
            <label className="mb-2 block text-sm text-gray-300">İlan Başlığı</label>
            <input
              name="title"
              required
              defaultValue={listing.title}
              className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">Açıklama</label>
            <textarea
              name="description"
              rows={5}
              defaultValue={listing.description ?? ""}
              className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm text-gray-300">Fiyat</label>
              <input
                name="price"
                type="number"
                required
                defaultValue={listing.price}
                className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">İlan Türü</label>
              <select
                name="listing_type"
                defaultValue={listing.listing_type}
                className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 outline-none focus:border-[#D4AF37]"
              >
                <option value="satilik">Satılık</option>
                <option value="kiralik">Kiralık</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">Emlak Tipi</label>
              <select
                name="property_type"
                defaultValue={listing.property_type}
                className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 outline-none focus:border-[#D4AF37]"
              >
                <option value="daire">Daire</option>
                <option value="arsa">Arsa</option>
                <option value="isyeri">İşyeri</option>
                <option value="villa">Villa</option>
              </select>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm text-gray-300">Şehir</label>
              <input
                name="city"
                required
                defaultValue={listing.city}
                className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">İlçe</label>
              <input
                name="district"
                required
                defaultValue={listing.district}
                className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">Mahalle</label>
              <input
                name="neighborhood"
                defaultValue={listing.neighborhood ?? ""}
                className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm text-gray-300">Brüt m²</label>
              <input
                name="gross_m2"
                type="number"
                defaultValue={listing.gross_m2 ?? ""}
                className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">Net m²</label>
              <input
                name="net_m2"
                type="number"
                defaultValue={listing.net_m2 ?? ""}
                className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">Oda Sayısı</label>
              <input
                name="room_count"
                defaultValue={listing.room_count ?? ""}
                className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">Banyo</label>
              <input
                name="bathroom_count"
                type="number"
                defaultValue={listing.bathroom_count ?? ""}
                className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm text-gray-300">Kat</label>
              <input
                name="floor_number"
                defaultValue={listing.floor_number ?? ""}
                className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">Bina Yaşı</label>
              <input
                name="building_age"
                type="number"
                defaultValue={listing.building_age ?? ""}
                className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">Adres</label>
              <input
                name="address"
                defaultValue={listing.address ?? ""}
                className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
  <div>
    <label className="mb-2 block text-sm text-gray-300">Isıtma</label>
    <select
      name="heating_type"
      defaultValue={listing.heating_type ?? ""}
      className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 outline-none focus:border-[#D4AF37]"
    >
      <option value="">Seçiniz</option>
      <option value="Doğalgaz Kombi">Doğalgaz Kombi</option>
      <option value="Merkezi Sistem">Merkezi Sistem</option>
      <option value="Klima">Klima</option>
      <option value="Yerden Isıtma">Yerden Isıtma</option>
      <option value="Soba">Soba</option>
    </select>
  </div>

  <div>
    <label className="mb-2 block text-sm text-gray-300">Otopark</label>
    <select
      name="parking"
      defaultValue={listing.parking ?? ""}
      className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 outline-none focus:border-[#D4AF37]"
    >
      <option value="">Seçiniz</option>
      <option value="Yok">Yok</option>
      <option value="Açık Otopark">Açık Otopark</option>
      <option value="Kapalı Otopark">Kapalı Otopark</option>
      <option value="Açık & Kapalı Otopark">Açık & Kapalı Otopark</option>
    </select>
  </div>

  <div>
    <label className="mb-2 block text-sm text-gray-300">Aidat</label>
    <input
      name="dues"
      type="number"
      defaultValue={listing.dues ?? ""}
      placeholder="1500"
      className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 outline-none focus:border-[#D4AF37]"
    />
  </div>
</div>

<div className="grid gap-5 md:grid-cols-2">
  <div>
    <label className="mb-2 block text-sm text-gray-300">Kullanım Durumu</label>
    <select
      name="usage_status"
      defaultValue={listing.usage_status ?? ""}
      className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 outline-none focus:border-[#D4AF37]"
    >
      <option value="">Seçiniz</option>
      <option value="Boş">Boş</option>
      <option value="Kiracılı">Kiracılı</option>
      <option value="Mülk Sahibi Oturuyor">Mülk Sahibi Oturuyor</option>
    </select>
  </div>

  <div>
    <label className="mb-2 block text-sm text-gray-300">Tapu Durumu</label>
    <select
      name="deed_status"
      defaultValue={listing.deed_status ?? ""}
      className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 outline-none focus:border-[#D4AF37]"
    >
      <option value="">Seçiniz</option>
      <option value="Kat Mülkiyetli">Kat Mülkiyetli</option>
      <option value="Kat İrtifaklı">Kat İrtifaklı</option>
      <option value="Arsa Tapulu">Arsa Tapulu</option>
      <option value="Müstakil Tapulu">Müstakil Tapulu</option>
    </select>
  </div>
</div>

<div className="grid gap-4 md:grid-cols-3">
  <label className="flex items-center gap-2 text-sm text-gray-300">
    <input name="furnished" type="checkbox" defaultChecked={listing.furnished} />
    Eşyalı
  </label>

  <label className="flex items-center gap-2 text-sm text-gray-300">
    <input name="in_site" type="checkbox" defaultChecked={listing.in_site} />
    Site İçinde
  </label>

  <label className="flex items-center gap-2 text-sm text-gray-300">
    <input name="balcony" type="checkbox" defaultChecked={listing.balcony} />
    Balkon
  </label>

  <label className="flex items-center gap-2 text-sm text-gray-300">
    <input name="elevator" type="checkbox" defaultChecked={listing.elevator} />
    Asansör
  </label>

  <label className="flex items-center gap-2 text-sm text-gray-300">
    <input
      name="credit_eligible"
      type="checkbox"
      defaultChecked={listing.credit_eligible}
    />
    Krediye Uygun
  </label>
</div>

<div className="grid gap-5 md:grid-cols-2">
  <div>
    <label className="mb-2 block text-sm text-gray-300">
      Latitude / Enlem
    </label>
    <input
      name="latitude"
      defaultValue={listing.latitude ?? ""}
      placeholder="38.2871"
      className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 outline-none focus:border-[#D4AF37]"
    />
  </div>

  <div>
    <label className="mb-2 block text-sm text-gray-300">
      Longitude / Boylam
    </label>
    <input
      name="longitude"
      defaultValue={listing.longitude ?? ""}
      placeholder="26.3777"
      className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 outline-none focus:border-[#D4AF37]"
    />
  </div>
</div>

<p className="text-xs text-gray-500">
  Google Maps’te konuma sağ tıklayın. İlk değer enlem, ikinci değer boylamdır.
</p>

<div>
  <label className="mb-2 block text-sm text-gray-300">
    İletişim Numarası
  </label>
  <input
    name="contact_phone"
    defaultValue={listing.phone ?? listing.whatsapp_phone ?? ""}
    placeholder="05551112233"
    className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 outline-none focus:border-[#D4AF37]"
  />
  <p className="mt-2 text-xs text-gray-500">
    Bu numara hem telefon araması hem de WhatsApp için kullanılacaktır.
  </p>
</div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Mevcut Fotoğraflar
            </label>

            {images.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-[#181818]"
                  >
                    <img
                      src={image.image_url}
                      alt="İlan fotoğrafı"
                      className="h-32 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(image)}
                      className="w-full bg-red-500/15 px-3 py-2 text-sm text-red-300 hover:bg-red-500/25"
                    >
                      Fotoğrafı Sil
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Bu ilanda fotoğraf yok.</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Yeni Fotoğraf Ekle
            </label>
            <input
              name="images"
              type="file"
              accept="image/*"
              multiple
              className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="flex flex-wrap gap-5">
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                name="is_published"
                type="checkbox"
                defaultChecked={listing.is_published}
              />
              Yayında
            </label>

            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                name="is_featured"
                type="checkbox"
                defaultChecked={listing.is_featured}
              />
              Öne çıkan ilan
            </label>
          </div>

          {errorMessage && (
            <p className="rounded-xl bg-red-500/10 p-3 text-sm text-red-300">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[#D4AF37] px-6 py-3 font-semibold text-black transition hover:bg-[#c9a72f] disabled:opacity-60"
          >
            {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </button>
        </form>
      </div>
    </main>
  );
}