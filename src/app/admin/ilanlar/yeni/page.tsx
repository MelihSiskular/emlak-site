"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

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

export default function NewListingPage() {
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

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);

    const title = String(formData.get("title"));
    const slug = `${createSlug(title)}-${Date.now()}`;
    const contactPhone = String(formData.get("contact_phone"));
    const payload = {
      title,
      slug,
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
latitude: String(formData.get("latitude")),
longitude: String(formData.get("longitude")),
    };

    const { data: insertedListing, error } = await supabase
      .from("listings")
      .insert(payload)
      .select("id")
      .single();

    if (error || !insertedListing) {
      setLoading(false);
      setErrorMessage(error?.message || "İlan oluşturulamadı.");
      return;
    }

const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  setLoading(false);
  setErrorMessage("Oturum bulunamadı. Lütfen tekrar giriş yapın.");
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
        const filePath = `${insertedListing.id}/${fileName}`;

       const { error: uploadError } = await supabase.storage
  .from("listing-images")
  .upload(filePath, file, {
    cacheControl: "3600",
    upsert: true,
  });

        if (uploadError) {
  console.error("Upload error:", uploadError);
  setLoading(false);
  setErrorMessage(`Fotoğraf yüklenemedi: ${uploadError.message}`);
  return;
}

        const { data: publicUrlData } = supabase.storage
          .from("listing-images")
          .getPublicUrl(filePath);

        imageRows.push({
          listing_id: insertedListing.id,
          image_url: publicUrlData.publicUrl,
          sort_order: i + 1,
        });
      }

      const { error: imageInsertError } = await supabase
        .from("listing_images")
        .insert(imageRows);

      if (imageInsertError) {
        setLoading(false);
        setErrorMessage(imageInsertError.message);
        return;
      }
    }

    setLoading(false);
    router.push("/admin/ilanlar");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] p-6 text-white">
      <div className="mx-auto max-w-5xl">
        <Link href="/admin/ilanlar" className="text-sm text-gray-400 hover:text-white">
          ← İlanlara dön
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-[#D4AF37]">
          Yeni İlan Ekle
        </h1>

        <form
          onSubmit={handleSubmit}
          className="mt-8 grid gap-5 rounded-3xl border border-white/10 bg-[#111111] p-6"
        >
          <div>
            <label className="mb-2 block text-sm text-gray-300">İlan Başlığı</label>
            <input
              name="title"
              required
              className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">Açıklama</label>
            <textarea
              name="description"
              rows={5}
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
                className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">İlan Türü</label>
              <select
                name="listing_type"
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
                defaultValue="Kırklareli"
                className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">İlçe</label>
              <input
                name="district"
                required
                placeholder="Merkez"
                className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">Mahalle</label>
              <input
                name="neighborhood"
                placeholder="Karakaş"
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
                className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">Net m²</label>
              <input
                name="net_m2"
                type="number"
                className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">Oda Sayısı</label>
              <input
                name="room_count"
                placeholder="3+1"
                className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">Banyo</label>
              <input
                name="bathroom_count"
                type="number"
                className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm text-gray-300">Kat</label>
              <input
                name="floor_number"
                placeholder="3"
                className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">Bina Yaşı</label>
              <input
                name="building_age"
                type="number"
                className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">Adres</label>
              <input
                name="address"
                placeholder="Kırklareli Merkez"
                className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div className="grid gap-5 md:grid-cols-3">
  <div>
    <label className="mb-2 block text-sm text-gray-300">Isıtma</label>
    <select
      name="heating_type"
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
    <input name="furnished" type="checkbox" />
    Eşyalı
  </label>

  <label className="flex items-center gap-2 text-sm text-gray-300">
    <input name="in_site" type="checkbox" />
    Site İçinde
  </label>

  <label className="flex items-center gap-2 text-sm text-gray-300">
    <input name="balcony" type="checkbox" />
    Balkon
  </label>

  <label className="flex items-center gap-2 text-sm text-gray-300">
    <input name="elevator" type="checkbox" />
    Asansör
  </label>

  <label className="flex items-center gap-2 text-sm text-gray-300">
    <input name="credit_eligible" type="checkbox" />
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
      placeholder="26.3777"
      className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 outline-none focus:border-[#D4AF37]"
    />
  </div>
</div>

<p className="text-xs text-gray-500">
  Google Maps’te konuma sağ tıklayın. İlk değer enlem, ikinci değer boylamdır.
</p>
          </div>
<div>
  <label className="mb-2 block text-sm text-gray-300">
    İletişim Numarası
  </label>
  <input
    name="contact_phone"
    defaultValue="905551112233"
    placeholder="05551112233"
    className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 outline-none focus:border-[#D4AF37]"
  />
  <p className="mt-2 text-xs text-gray-500">
    Bu numara hem telefon araması hem de WhatsApp için kullanılacaktır.
  </p>
</div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              İlan Fotoğrafları
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
              <input name="is_published" type="checkbox" defaultChecked />
              Yayında
            </label>

            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input name="is_featured" type="checkbox" />
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
            disabled={loading}
            className="rounded-xl bg-[#D4AF37] px-6 py-3 font-semibold text-black transition hover:bg-[#c9a72f] disabled:opacity-60"
          >
            {loading ? "Kaydediliyor..." : "İlanı Kaydet"}
          </button>
        </form>
      </div>
    </main>
  );
}