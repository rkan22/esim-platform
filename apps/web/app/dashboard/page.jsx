"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const TOKEN_KEY = "esim_platform_token";
const API_BASE_KEY = "esim_platform_api_base";

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStats();
  }, []);

  async function safeJson(res) {
    const text = await res.text();

    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`Backend JSON dönmüyor. Gelen cevap: ${text.slice(0, 80)}`);
    }
  }

  async function loadStats() {
    try {
      setError("");

      const token = localStorage.getItem(TOKEN_KEY) || "";
      const apiBase = (localStorage.getItem(API_BASE_KEY) || "").trim().replace(/\/+$/, "");

      if (!token || !apiBase) {
        router.push("/");
        return;
      }

      const res = await fetch(`${apiBase}/api/dashboard/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await safeJson(res);

      if (!res.ok) {
        throw new Error(data.error || "Load failed");
      }

      setStats(data);
    } catch (err) {
      setError(err.message || "Load failed");
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(API_BASE_KEY);
    router.push("/");
  }

  return (
    <main style={pageStyle}>
      <Nav />
      <div style={headerRowStyle}>
        <h1 style={{ fontSize: 58, margin: 0 }}>Dashboard</h1>
        <button onClick={logout} style={logoutStyle}>Logout</button>
      </div>

      {error ? <div style={errorStyle}>{error}</div> : null}

      {!stats ? (
        <div style={{ fontSize: 28 }}>Loading...</div>
      ) : (
        <div style={gridStyle}>
          <Card title="Wallet Balance" value={`€${stats.walletBalance}`} />
          <Card title="Today Revenue" value={`€${stats.todayRevenue}`} />
          <Card title="Orders" value={String(stats.orders)} />
          <Card title="Active Resellers" value={String(stats.activeResellers)} />
        </div>
      )}
    </main>
  );
}

function Nav() {
  return (
    <div style={{ marginBottom: 32, fontSize: 18 }}>
      <a href="/dashboard" style={linkStyle}>Dashboard</a>
      <a href="/orders" style={linkStyle}>Orders</a>
      <a href="/wallet" style={linkStyle}>Wallet</a>
      <a href="/support" style={linkStyle}>Support</a>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div style={cardStyle}>
      <div style={{ color: "#aaa", marginBottom: 10 }}>{title}</div>
      <div style={{ fontSize: 34, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#000",
  color: "#fff",
  padding: 24,
};

const headerRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 30,
};

const gridStyle = {
  display: "grid",
  gap: 16,
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
};

const cardStyle = {
  background: "#111",
  border: "1px solid #222",
  borderRadius: 18,
  padding: 20,
};

const errorStyle = {
  background: "#4a1414",
  border: "1px solid #8a2f2f",
  color: "#ffb8b8",
  padding: 14,
  borderRadius: 14,
  marginBottom: 20,
};

const logoutStyle = {
  height: 56,
  padding: "0 24px",
  borderRadius: 18,
  border: "1px solid #2f2f2f",
  background: "#111",
  color: "#fff",
  cursor: "pointer",
};

const linkStyle = {
  color: "#fff",
  marginRight: 18,
};