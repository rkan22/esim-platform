"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const TOKEN_KEY = "esim_platform_token";
const API_BASE_KEY = "esim_platform_api_base";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
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

        const res = await fetch(`${apiBase}/api/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load orders");
        }

        setOrders(data.orders || []);
      } catch (err) {
        setError(err.message || "Error");
      }
    }

    load();
  }, [router]);

  return (
    <main style={pageStyle}>
      <Nav />
      <h1>Orders</h1>
      {error ? <div style={errorStyle}>{error}</div> : null}

      <div style={{ display: "grid", gap: 12 }}>
        {orders.map((order) => (
          <div key={order.id} style={cardStyle}>
            <div><b>ID:</b> {order.id}</div>
            <div><b>Plan:</b> {order.plan}</div>
            <div><b>Status:</b> {order.status}</div>
            <div><b>Amount:</b> €{order.amount}</div>
            <div><b>Country:</b> {order.country}</div>
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