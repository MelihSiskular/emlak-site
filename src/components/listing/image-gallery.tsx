"use client";

import { useState } from "react";

type ListingImage = {
  id: string;
  image_url: string;
  sort_order: number;
};

type Props = {
  images: ListingImage[];
  title: string;
};

export default function ImageGallery({ images, title }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const selectedImage =
    selectedIndex !== null ? images[selectedIndex] : null;

  function openImage(index: number) {
    setSelectedIndex(index);
  }

  function closeImage() {
    setSelectedIndex(null);
  }

  function nextImage() {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % images.length);
  }

  function prevImage() {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
  }

  if (images.length === 0) {
    return (
      <div className="flex h-[420px] w-full items-center justify-center rounded-3xl border border-white/10 bg-[#141414] text-gray-500 md:h-[520px]">
        Fotoğraf yok
      </div>
    );
  }

  const mainImage = images[0];
  const sideImages = images.slice(1, 5);

  return (
    <>
      <section className="mt-8 grid gap-4 lg:grid-cols-12">
        <button
          type="button"
          onClick={() => openImage(0)}
          className="lg:col-span-7"
        >
          <img
            src={mainImage.image_url}
            alt={title}
            className="h-[420px] w-full rounded-3xl border border-white/10 object-cover transition hover:opacity-90 md:h-[520px]"
          />
        </button>

        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-2">
          {sideImages.map((img, index) => (
            <button
              type="button"
              key={img.id}
              onClick={() => openImage(index + 1)}
            >
              <img
                src={img.image_url}
                alt={title}
                className="h-[200px] w-full rounded-2xl border border-white/10 object-cover transition hover:opacity-90 md:h-[250px]"
              />
            </button>
          ))}
        </div>
      </section>

      {selectedImage && selectedIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <button
            onClick={closeImage}
            className="absolute right-5 top-5 rounded-full bg-white px-4 py-2 text-black"
          >
            Kapat
          </button>

          <button
            onClick={prevImage}
            className="absolute left-5 rounded-full bg-white px-4 py-3 text-black"
          >
            ←
          </button>

          <img
            src={selectedImage.image_url}
            alt={title}
            className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain"
          />

          <button
            onClick={nextImage}
            className="absolute right-5 rounded-full bg-white px-4 py-3 text-black"
          >
            →
          </button>

          <div className="absolute bottom-5 rounded-full bg-white/10 px-4 py-2 text-sm text-white">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}