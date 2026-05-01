"use client";

export default function LogoutButton() {
  function handleLogout() {
    window.location.href = "/admin/logout";
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
    >
      Çıkış Yap
    </button>
  );
}