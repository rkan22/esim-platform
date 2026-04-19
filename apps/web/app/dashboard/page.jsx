"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const TOKEN_KEY = "esim_platform_token";
const API_BASE_KEY = "esim_platform_api_base";

async function apiGet(path) {
  const token = localStorage.getItem(TOKEN_KEY) || "";
  const apiBase = (localStorage.getItem(API_BASE_KEY) || "").replace(/\/$/, "");

  if (!token || !apiBase) {
    throw new Error("Missing token or API base");
  }

  const res = await fetch(`${apiBase}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.error || "Request failed");
  }

  return data;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet("/api/dashboard/stats");
        setStats(data);
      } catch (err) {
        setError(err.message || "Failed");
      }
    }

    load();
  }, []);

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(API_BASE_KEY);
    router.push("/");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        padding: 24,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
        <h1>Dashboard</h1>
        <button
          onClick={logout}
          style={{
            height: 42,
            padding: "0 16px",
            borderRadius: 12,
            border: "1px solid #333",
            background: "#111",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      {error ? (
        <div
          style={{
            background: "#2a1111",
            border: "1px solid #5a2222",
            color: "#ffb3b3",
            padding: 12,
            borderRadius: 12,
            marginBottom: 14,
          }}
        >
          {error}
        </div>
      ) : null}

      {!stats ? (
        <div>Loading...</div>
      ) : (
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(4, 1fr)" }}>
          <Card title="Wallet Balance" value={`€${stats.walletBalance}`} />
          <Card title="Today Revenue" value={`€${stats.todayRevenue}`} />
          <Card title="Orders" value={String(stats.orders)} />
          <Card title="Active Resellers" value={String(stats.activeResellers)} />
        </div>
      )}
    </main>
  );
}

function Card({ title, value }) {
  return (
    <div
      style={{
        background: "#111",
        border: "1px solid #222",
        borderRadius: 18,
        padding: 20,
      }}
    >
      <div style={{ color: "#aaa", marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
