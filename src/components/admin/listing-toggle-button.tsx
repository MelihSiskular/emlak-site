"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  listingId: string;
  field: "is_published" | "is_featured";
  value: boolean;
  trueLabel: string;
  falseLabel: string;
};

export default function ListingToggleButton({
  listingId,
  field,
  value,
  trueLabel,
  falseLabel,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [currentValue, setCurrentValue] = useState(value);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);

    const nextValue = !currentValue;

    const { error } = await supabase
      .from("listings")
      .update({ [field]: nextValue })
      .eq("id", listingId);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setCurrentValue(nextValue);
    router.refresh();
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={
        currentValue
          ? "rounded-full bg-green-500/15 px-3 py-1 text-xs font-medium text-green-300 transition hover:bg-green-500/25 disabled:opacity-60"
          : "rounded-full bg-yellow-500/15 px-3 py-1 text-xs font-medium text-yellow-300 transition hover:bg-yellow-500/25 disabled:opacity-60"
      }
    >
      {loading ? "..." : currentValue ? trueLabel : falseLabel}
    </button>
  );
}