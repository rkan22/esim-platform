"use client";

import { useEffect, useState } from "react";

const TOKEN_KEY = "esim_platform_token";
const API_BASE_KEY = "esim_platform_api_base";

export default function WalletPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const token = localStorage.getItem(TOKEN_KEY);
    const api = localStorage.getItem(API_BASE_KEY);

    const res = await fetch(`${api}/api/wallet`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setData(await res.json());
  }

  if (!data) return <div className="p-6 text-white">Loading...</div>;

  return (
    <main className="p-6 text-white bg-[#060606] min-h-screen">
      <h1 className="text-4xl mb-6">Wallet</h1>

      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 mb-6">
        Balance: €{data.balance}
      </div>

      {data.transactions.map(t => (
        <div key={t.id} className="p-4 mb-3 rounded-xl bg-white/5 border border-white/10">
          {t.type} - €{t.amount}
        </div>
      ))}
    </main>
  );
}