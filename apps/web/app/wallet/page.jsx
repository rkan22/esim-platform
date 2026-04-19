"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const TOKEN_KEY = "esim_platform_token";
const API_BASE_KEY = "esim_platform_api_base";

export default function WalletPage() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem(TOKEN_KEY) || "";
        const apiBase = (localStorage.getItem(API_BASE_KEY) || "").replace(/\/$/, "");

        if (!token || !apiBase) {
          router.push("/");
          return;
        }

        const res = await fetch(`${apiBase}/api/wallet`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load wallet");
        }

        setBalance(data.balance || 0);
        setTransactions(data.transactions || []);
      } catch (err) {
        setError(err.message || "Error");
      }
    }

    load();
  }, [router]);

  return (
    <main style={pageStyle}>
      <Nav />
      <h1>Wallet</h1>
      {error ? <div style={errorStyle}>{error}</div> : null}

      <div style={{ ...cardStyle, marginBottom: 20 }}>
        <div style={{ color: "#aaa" }}>Current Balance</div>
        <div style={{ fontSize: 32, fontWeight: 700 }}>€{balance}</div>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {transactions.map((tx) => (
          <div key={tx.id} style={cardStyle}>
            <div><b>ID:</b> {tx.id}</div>
            <div><b>Type:</b> {tx.type}</div>
            <div><b>Amount:</b> €{tx.amount}</div>
            <div><b>Status:</b> {tx.status}</div>
          </div>
        ))}
      </div>
    </main>
  );
}

function Nav() {
  return (
    <div style={{ marginBottom: 24 }}>
      <a href="/dashboard" style={linkStyle}>Dashboard</a>
      <a href="/orders" style={linkStyle}>Orders</a>
      <a href="/wallet" style={linkStyle}>Wallet</a>
      <a href="/support" style={linkStyle}>Support</a>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#000",
  color: "#fff",
  padding: 24,
};

const cardStyle = {
  background: "#111",
  border: "1px solid #222",
  borderRadius: 16,
  padding: 16,
};

const errorStyle = {
  background: "#2a1111",
  border: "1px solid #5a2222",
  color: "#ffb3b3",
  padding: 12,
  borderRadius: 12,
  marginBottom: 14,
};

const linkStyle = {
  color: "#fff",
  marginRight: 12,
};