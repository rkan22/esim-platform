"use client";

import { useEffect, useState } from "react";

export default function WalletPage() {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    async function load() {
      const api = localStorage.getItem("esim_platform_api_base");
      const token = localStorage.getItem("esim_platform_token");

      const res = await fetch(`${api}/api/wallet`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setBalance(data.balance || 0);
    }

    load();
  }, []);

  return (
    <main style={{ padding: 24, color: "#fff", background: "#000", minHeight: "100vh" }}>
      <h1>Wallet</h1>
      <h2>€{balance}</h2>
    </main>
  );
}
