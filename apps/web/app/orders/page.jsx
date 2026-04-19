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
    loadOrders();
  }, []);

  async function safeJson(res) {
    const text = await res.text();

    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`Backend JSON dönmüyor. Gelen cevap: ${text.slice(0, 80)}`);
    }
  }

  async function loadOrders() {
    try {
      setError("");

      const token = localStorage.getItem(TOKEN_KEY) || "";
      const rawApiBase = localStorage.getItem(API_BASE_KEY) || "";
      const apiBase = rawApiBase.trim().replace(/\/+$/, "");

      if (!token || !apiBase) {
        router.push("/");
        return;
      }

      const url = `${apiBase}/api/orders`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await safeJson(res);

      if (!res.ok) {
        throw new Error(data.error || "Orders yüklenemedi");
      }

      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (err) {
      setError(err.message || "Error");
    }
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
      <div style={{ marginBottom: 24 }}>
        <a href="/dashboard" style={{ color: "#fff", marginRight: 12 }}>Dashboard</a>
        <a href="/orders" style={{ color: "#fff", marginRight: 12 }}>Orders</a>
        <a href="/wallet" style={{ color: "#fff", marginRight: 12 }}>Wallet</a>
        <a href="/support" style={{ color: "#fff", marginRight: 12 }}>Support</a>
      </div>

      <h1>Orders</h1>

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

      <div style={{ display: "grid", gap: 12 }}>
        {orders.map((order) => (
          <div
            key={order.id}
            style={{
              background: "#111",
              border: "1px solid #222",
              borderRadius: 16,
              padding: 16,
            }}
          >
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